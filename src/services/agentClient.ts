import { ConversationTurn, VesselAgentResponse } from '../types/agent';
import { VesselContext } from '../types/vessel';
import { interpretLocally } from '../domain/fallback';
import { getAgentUrl, getPlatformUrl } from './apiUrl';

const ALLOWED_EVENTS = new Set([
  'VESSEL_STATUS_UPDATED',
  'VESSEL_WARNING_REPORTED',
  'VESSEL_EMERGENCY_TRIGGERED',
  'VESSEL_RECOVERY_REPORTED',
  'VESSEL_MANEUVERABILITY_RESTORED',
  'VESSEL_MESSAGE_SENT',
]);

export const validateAgentResponse = (payload: unknown): VesselAgentResponse | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const data = payload as Partial<VesselAgentResponse>;
  if (typeof data.message !== 'string' || !data.message.trim()) {
    return null;
  }
  let proposedEvent = data.proposedEvent ?? null;
  if (proposedEvent && !ALLOWED_EVENTS.has(proposedEvent.type)) {
    proposedEvent = null;
  }
  return {
    message: data.message.trim().slice(0, 280),
    intent: data.intent || 'UNKNOWN',
    confidence: typeof data.confidence === 'number' ? data.confidence : 0.5,
    proposedEvent,
    requiresConfirmation: Boolean(data.requiresConfirmation) && Boolean(proposedEvent),
    clarification: data.clarification ?? null,
    usedFallback: Boolean(data.usedFallback),
    speak: data.speak !== false,
  };
};

const postAgent = async (baseUrl: string, body: unknown): Promise<VesselAgentResponse | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${baseUrl}/api/agents/vessel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    return validateAgentResponse(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const requestAgentSpeech = async (
  text: string,
  language: 'en' | 'no' = 'en'
): Promise<{ audioBase64: string; mimeType: string } | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${getAgentUrl()}/api/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 400), language }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { audioBase64?: string; mimeType?: string };
    if (!data.audioBase64) {
      return null;
    }
    return {
      audioBase64: data.audioBase64,
      mimeType: data.mimeType || 'audio/mpeg',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const requestVesselAgent = async (
  message: string,
  vessel: VesselContext,
  conversation: ConversationTurn[],
  pendingClarification?: string | null
): Promise<{ response: VesselAgentResponse; agentUnavailable: boolean }> => {
  const payload = {
    message: message.slice(0, 500),
    context: vessel,
    conversation: conversation.slice(-6).map((turn) => ({
      role: turn.role === 'agent' ? 'assistant' : 'user',
      text: turn.text,
    })),
    pendingClarification: pendingClarification || null,
  };

  const remote =
    (await postAgent(getAgentUrl(), payload)) || (await postAgent(getPlatformUrl(), payload));
  if (remote) {
    return { response: remote, agentUnavailable: false };
  }

  return {
    response: interpretLocally(message, pendingClarification),
    agentUnavailable: true,
  };
};
