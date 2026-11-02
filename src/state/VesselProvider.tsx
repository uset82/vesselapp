import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createDemoVessel } from '../data/demoVessel';
import { createEmergencyEvent, createVesselEvent, nowClock } from '../domain/events';
import { requestVesselAgent } from '../services/agentClient';
import { interpretLocally } from '../domain/fallback';
import {
  connectToPlatform,
  fetchPlatformStatus,
  resetPlatformScenario,
  sendVesselEvent,
} from '../services/platformClient';
import { requestSpeechPermissions, SpeechPermissionState } from '../services/speechPermissions';
import { cancelListening, startListening, stopListening } from '../services/speechToText';
import { speakText, stopSpeech, unlockWebPlayback } from '../services/textToSpeech';
import { pulseLight, pulseSuccess, pulseWarn } from '../services/haptics';
import { ConversationTurn, PendingInterpretation, VesselAgentResponse } from '../types/agent';
import { VesselEventType } from '../types/events';
import { CaptainInteractionState, HistoryEntry, PlatformAcknowledgement, VesselContext } from '../types/vessel';

interface VesselStore {
  vessel: VesselContext;
  interaction: CaptainInteractionState;
  conversation: ConversationTurn[];
  history: HistoryEntry[];
  pending: PendingInterpretation | null;
  acknowledgement: PlatformAcknowledgement | null;
  partialTranscript: string;
  typedOpen: boolean;
  heardDraft: string;
  agentUnavailable: boolean;
  speechPermission: SpeechPermissionState;
  lastError: string | null;
  submitting: boolean;
  ttsEnabled: boolean;
  platformStatusLabel: string;
  showDemo: boolean;
  lastReportIsEmergency: boolean;
  lastReportedIncidentType: string | null;
  handleToggleType: () => void;
  handleSendText: (text: string) => Promise<void>;
  handleMicPress: () => Promise<void>;
  handleCancelListen: () => Promise<void>;
  handleConfirm: () => Promise<void>;
  handleCancelConfirm: () => void;
  handleContinueTalking: () => void;
  handleManualEmergency: () => void;
  handleDemoLost: () => void;
  handleDemoFire: () => void;
  handleDemoFireContained: () => void;
  handleDemoRestore: () => void;
  handleReset: () => Promise<void>;
  handleRequestSpeech: () => Promise<void>;
  handleStopSpeaking: () => Promise<void>;
  handleToggleTts: () => void;
  handleToggleDemo: () => void;
}

const VesselContextStore = createContext<VesselStore | null>(null);

const stamp = (): string => nowClock();

const makeTurn = (
  role: ConversationTurn['role'],
  text: string,
  source: ConversationTurn['source'] = 'system'
): ConversationTurn => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  role,
  text,
  timestamp: stamp(),
  source,
});

const makeHistory = (actor: HistoryEntry['actor'], text: string): HistoryEntry => ({
  id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  actor,
  text,
  timestamp: stamp(),
});

export const VesselProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vessel, setVessel] = useState<VesselContext>(createDemoVessel);
  const [interaction, setInteraction] = useState<CaptainInteractionState>('IDLE');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([
    makeHistory('system', 'Vessel connected'),
  ]);
  const [pending, setPending] = useState<PendingInterpretation | null>(null);
  const [acknowledgement, setAcknowledgement] = useState<PlatformAcknowledgement | null>(null);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [typedOpen, setTypedOpen] = useState(false);
  const [heardDraft, setHeardDraft] = useState('');
  const [agentUnavailable, setAgentUnavailable] = useState(false);
  const [speechPermission, setSpeechPermission] = useState<SpeechPermissionState>('undetermined');
  const [lastError, setLastError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [platformStatusLabel, setPlatformStatusLabel] = useState('Connecting');
  const [showDemo, setShowDemo] = useState(false);
  const [lastReportIsEmergency, setLastReportIsEmergency] = useState(false);
  const [lastReportedIncidentType, setLastReportedIncidentType] = useState<string | null>(null);
  const lastEmergencyId = useRef<string | null>(null);
  const pendingClarification = useRef<string | null>(null);
  const listeningRef = useRef(false);

  const pushHistory = useCallback((actor: HistoryEntry['actor'], text: string) => {
    setHistory((current) => [makeHistory(actor, text), ...current].slice(0, 40));
  }, []);

  const speakReply = useCallback(
    async (text: string, speak?: boolean) => {
      if (!ttsEnabled || speak === false) {
        return;
      }
      await speakText(text, 'en');
    },
    [ttsEnabled]
  );

  const applyInterpretation = useCallback(
    async (response: VesselAgentResponse, captainText: string) => {
      setConversation((current) => [...current, makeTurn('agent', response.message)]);
      pushHistory('agent', response.message);
      pendingClarification.current = response.clarification || null;

      if (response.requiresConfirmation && response.proposedEvent) {
        setPending({ response, captainText });
        setInteraction('CONFIRMATION_REQUIRED');
        pulseWarn();
        void speakReply(response.message, response.speak);
        return;
      }

      setInteraction('IDLE');
      void speakReply(response.message, response.speak);
    },
    [pushHistory, speakReply]
  );

  const interpret = useCallback(
    async (text: string, source: ConversationTurn['source']) => {
      const clean = text.trim();
      if (!clean) {
        setInteraction('IDLE');
        return;
      }
      const captainTurn = makeTurn('captain', clean, source);
      const nextConversation = [...conversation, captainTurn];
      setConversation(nextConversation);
      pushHistory('captain', clean);
      setInteraction('UNDERSTANDING');
      setLastError(null);

      const { response, agentUnavailable: down } = await requestVesselAgent(
        clean,
        vessel,
        nextConversation,
        pendingClarification.current
      );
      setAgentUnavailable(down);
      await applyInterpretation(response, clean);
    },
    [applyInterpretation, conversation, pushHistory, vessel]
  );

  const handleSendText = useCallback(
    async (text: string) => {
      setTypedOpen(true);
      setHeardDraft('');
      await interpret(text, 'typed');
    },
    [interpret]
  );

  const handleMicPress = useCallback(async () => {
    if (listeningRef.current) {
      setInteraction('TRANSCRIBING');
      listeningRef.current = false;
      const result = await stopListening();
      setPartialTranscript('');
      if (!result.text.trim()) {
        setTypedOpen(true);
        setLastError('I did not hear a report. Tap the microphone again or type instead.');
        setInteraction('IDLE');
        return;
      }
      const heard = result.text.trim();
      const local = interpretLocally(heard, pendingClarification.current);
      setHeardDraft(heard);
      setTypedOpen(true);
      if (local.intent === 'UNKNOWN') {
        setLastError(`I heard: “${heard}”. Correct it if Safari missed a word, then send.`);
        setInteraction('IDLE');
        return;
      }
      await interpret(heard, result.provider === 'apple-speech' ? 'apple-speech' : 'typed');
      return;
    }

    if (interaction === 'CONFIRMATION_REQUIRED') {
      return;
    }

    await unlockWebPlayback();
    await stopSpeech();
    const permission = await requestSpeechPermissions();
    setSpeechPermission(permission);
    if (permission !== 'granted') {
      setTypedOpen(true);
      setLastError('Microphone unavailable. Type the report instead.');
      return;
    }

    try {
      pulseLight();
      await startListening({ onPartial: setPartialTranscript });
      listeningRef.current = true;
      setInteraction('LISTENING');
      setPartialTranscript('');
    } catch {
      setTypedOpen(true);
      setLastError('Voice capture failed. Type instead.');
      setInteraction('ERROR');
    }
  }, [interaction, interpret]);

  const handleCancelListen = useCallback(async () => {
    listeningRef.current = false;
    await cancelListening();
    setPartialTranscript('');
    setInteraction('IDLE');
  }, []);

  const submitEvent = useCallback(
    async (response: VesselAgentResponse) => {
      if (!response.proposedEvent || submitting) {
        return;
      }
      if (response.proposedEvent.type === 'VESSEL_EMERGENCY_TRIGGERED' && lastEmergencyId.current) {
        setLastError('Emergency already reported for this training scenario.');
        return;
      }

      setSubmitting(true);
      setInteraction('REPORTING');
      const isEmergency = response.proposedEvent.type === 'VESSEL_EMERGENCY_TRIGGERED';
      const event =
        response.proposedEvent.type === 'VESSEL_EMERGENCY_TRIGGERED'
          ? createEmergencyEvent(
              vessel,
              response.proposedEvent.incidentType === 'PROPULSION_FAILURE' ||
                response.proposedEvent.incidentType === 'FLOODING' ||
                response.proposedEvent.incidentType === 'FIRE_ONBOARD'
                ? response.proposedEvent.incidentType
                : 'MANEUVERABILITY_LOST'
            )
          : createVesselEvent(
              response.proposedEvent.type as VesselEventType,
              vessel,
              {
                incidentType: response.proposedEvent.incidentType,
                reportedBy: 'CAPTAIN',
              },
              vessel.activeIncidentId
            );

      const ack = await sendVesselEvent(event);
      setAcknowledgement(ack);
      if (!ack.acknowledged) {
        setVessel((current) => ({ ...current, platformConnection: 'DISCONNECTED', updatedAt: new Date().toISOString() }));
        setPlatformStatusLabel('Connection lost');
        setInteraction('ERROR');
        setLastError('Platform did not acknowledge. The emergency is held locally and was not marked delivered.');
        setSubmitting(false);
        return;
      }

      lastEmergencyId.current = isEmergency ? event.id : lastEmergencyId.current;
      setLastReportIsEmergency(isEmergency);
      setVessel((current) => ({
        ...current,
        platformConnection: 'CONNECTED',
        activeIncidentId: ack.incidentId || current.activeIncidentId,
        maneuverabilityStatus:
          response.proposedEvent?.type === 'VESSEL_EMERGENCY_TRIGGERED'
            ? 'LOST'
            : response.proposedEvent?.type === 'VESSEL_MANEUVERABILITY_RESTORED'
              ? 'RESTORED'
              : current.maneuverabilityStatus,
        propulsionStatus:
          response.proposedEvent?.type === 'VESSEL_RECOVERY_REPORTED' ? 'RECOVERING' : current.propulsionStatus,
        fireStatus:
          response.proposedEvent?.type === 'VESSEL_EMERGENCY_TRIGGERED' &&
          response.proposedEvent.incidentType === 'FIRE_ONBOARD'
            ? 'ACTIVE'
            : response.proposedEvent?.type === 'VESSEL_RECOVERY_REPORTED' &&
                response.proposedEvent.incidentType === 'FIRE_UNDER_CONTROL'
              ? 'CONTAINED'
              : current.fireStatus,
        updatedAt: new Date().toISOString(),
      }));
      setPlatformStatusLabel(ack.platformStatus || 'ACTIVE');
      pushHistory('platform', `Platform: ${ack.platformStatus || 'received'} (${ack.eventId})`);
      setLastReportedIncidentType(response.proposedEvent.incidentType || null);
      setPending(null);
      setInteraction('REPORTED');
      pulseSuccess();
      setSubmitting(false);
    },
    [pushHistory, submitting, vessel]
  );

  const handleConfirm = useCallback(async () => {
    if (!pending) {
      return;
    }
    await submitEvent(pending.response);
  }, [pending, submitEvent]);

  const handleCancelConfirm = useCallback(() => {
    setPending(null);
    setInteraction('IDLE');
    pushHistory('system', 'Captain cancelled the proposed report.');
  }, [pushHistory]);

  const handleContinueTalking = useCallback(() => {
    setInteraction('IDLE');
  }, []);

  const handleManualEmergency = useCallback(() => {
    const response: VesselAgentResponse = {
      message: 'Training backup: maneuverability lost. Report this emergency to SOGN SAFE?',
      intent: 'MANEUVERABILITY_LOST',
      confidence: 1,
      proposedEvent: { type: 'VESSEL_EMERGENCY_TRIGGERED', incidentType: 'MANEUVERABILITY_LOST' },
      requiresConfirmation: true,
      usedFallback: true,
      speak: false,
    };
    setPending({ response, captainText: 'Manual training trigger' });
    setInteraction('CONFIRMATION_REQUIRED');
  }, []);

  const handleDemoLost = useCallback(() => {
    handleManualEmergency();
    setShowDemo(false);
  }, [handleManualEmergency]);

  const handleDemoFire = useCallback(() => {
    const response: VesselAgentResponse = {
      message: 'Training backup: fire onboard. Report this emergency to SOGN SAFE?',
      intent: 'FIRE_ONBOARD',
      confidence: 1,
      proposedEvent: { type: 'VESSEL_EMERGENCY_TRIGGERED', incidentType: 'FIRE_ONBOARD' },
      requiresConfirmation: true,
      usedFallback: true,
      speak: false,
    };
    setPending({ response, captainText: 'Manual fire trigger' });
    setInteraction('CONFIRMATION_REQUIRED');
    setShowDemo(false);
  }, []);

  const handleDemoFireContained = useCallback(() => {
    const response: VesselAgentResponse = {
      message: 'I understood: fire under control. Send this update?',
      intent: 'RECOVERY',
      confidence: 1,
      proposedEvent: { type: 'VESSEL_RECOVERY_REPORTED', incidentType: 'FIRE_UNDER_CONTROL' },
      requiresConfirmation: true,
      usedFallback: true,
      speak: false,
    };
    setPending({ response, captainText: 'Demo fire contained' });
    setInteraction('CONFIRMATION_REQUIRED');
    setShowDemo(false);
  }, []);

  const handleDemoRestore = useCallback(() => {
    const response: VesselAgentResponse = {
      message: 'I understood: maneuverability restored. Send this update?',
      intent: 'MANEUVERABILITY_RESTORED',
      confidence: 1,
      proposedEvent: { type: 'VESSEL_MANEUVERABILITY_RESTORED', incidentType: 'MANEUVERABILITY_RESTORED' },
      requiresConfirmation: true,
      usedFallback: true,
      speak: false,
    };
    setPending({ response, captainText: 'Demo restore' });
    setInteraction('CONFIRMATION_REQUIRED');
    setShowDemo(false);
  }, []);

  const handleReset = useCallback(async () => {
    await stopSpeech();
    await cancelListening();
    listeningRef.current = false;
    lastEmergencyId.current = null;
    pendingClarification.current = null;
    await resetPlatformScenario(vessel.vesselId);
    const next = createDemoVessel();
    setVessel(next);
    setInteraction('IDLE');
    setConversation([]);
    setHistory([makeHistory('system', 'Vessel connected')]);
    setPending(null);
    setAcknowledgement(null);
    setPartialTranscript('');
    setHeardDraft('');
    setAgentUnavailable(false);
    setLastError(null);
    setPlatformStatusLabel('Connected');
    setShowDemo(false);
    setLastReportIsEmergency(false);
    setLastReportedIncidentType(null);
    void connectToPlatform(next.vesselId);
  }, [vessel.vesselId]);

  const handleRequestSpeech = useCallback(async () => {
    const permission = await requestSpeechPermissions();
    setSpeechPermission(permission);
  }, []);

  const pollPlatform = useCallback(async () => {
    const status = await fetchPlatformStatus();
    if (!status) {
      setVessel((current) => ({ ...current, platformConnection: 'DISCONNECTED' }));
      setPlatformStatusLabel('Connection lost');
      return;
    }
    setVessel((current) => ({
      ...current,
      platformConnection: 'CONNECTED',
      activeIncidentId: status.incidentId || current.activeIncidentId,
    }));
    setPlatformStatusLabel(status.platformStatus || 'Connected');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      setVessel((current) => ({ ...current, platformConnection: 'CONNECTING' }));
      const ok = await connectToPlatform(DEMO_CONNECT_ID);
      if (cancelled) {
        return;
      }
      setVessel((current) => ({
        ...current,
        platformConnection: ok ? 'CONNECTED' : 'DISCONNECTED',
        updatedAt: new Date().toISOString(),
      }));
      setPlatformStatusLabel(ok ? 'Connected' : 'Connection lost');
      if (ok) {
        pushHistory('platform', 'Platform connected');
      }
    };
    void boot();
    const timer = setInterval(() => {
      void pollPlatform();
    }, 6000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pollPlatform, pushHistory]);

  const value = useMemo<VesselStore>(
    () => ({
      vessel,
      interaction,
      conversation,
      history,
      pending,
      acknowledgement,
      partialTranscript,
      typedOpen,
      heardDraft,
      agentUnavailable,
      speechPermission,
      lastError,
      submitting,
      ttsEnabled,
      platformStatusLabel,
      showDemo,
      lastReportIsEmergency,
      lastReportedIncidentType,
      handleToggleType: () => setTypedOpen((open) => !open),
      handleSendText,
      handleMicPress,
      handleCancelListen,
      handleConfirm,
      handleCancelConfirm,
      handleContinueTalking,
      handleManualEmergency,
      handleDemoLost,
      handleDemoFire,
      handleDemoFireContained,
      handleDemoRestore,
      handleReset,
      handleRequestSpeech,
      handleStopSpeaking: stopSpeech,
      handleToggleTts: () => setTtsEnabled((value) => !value),
      handleToggleDemo: () => setShowDemo((value) => !value),
    }),
    [
      acknowledgement,
      agentUnavailable,
      conversation,
      handleCancelConfirm,
      handleCancelListen,
      handleConfirm,
      handleContinueTalking,
      handleDemoLost,
      handleDemoFire,
      handleDemoFireContained,
      handleDemoRestore,
      handleManualEmergency,
      handleMicPress,
      handleRequestSpeech,
      handleReset,
      handleSendText,
      heardDraft,
      history,
      interaction,
      lastError,
      partialTranscript,
      pending,
      platformStatusLabel,
      showDemo,
      lastReportIsEmergency,
      lastReportedIncidentType,
      speechPermission,
      submitting,
      ttsEnabled,
      typedOpen,
      vessel,
    ]
  );

  return <VesselContextStore.Provider value={value}>{children}</VesselContextStore.Provider>;
};

const DEMO_CONNECT_ID = 'MS_FJORD_STAR';

export const useVessel = (): VesselStore => {
  const value = useContext(VesselContextStore);
  if (!value) {
    throw new Error('useVessel must be used inside VesselProvider');
  }
  return value;
};
