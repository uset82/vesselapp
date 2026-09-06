import { VesselAgentResponse } from '../types/agent';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9æøåäöüé\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesAny = (haystack: string, phrases: string[]): boolean =>
  phrases.some((phrase) => haystack.includes(phrase));

const EMERGENCY = [
  'lost maneuverability',
  'lost manoeuvrability',
  'cannot steer',
  'can not steer',
  "can't steer",
  'lost steering',
  'no steering',
  'steering failure',
  'ship is not responding',
  'vessel is not responding',
  'we have lost control',
  "we've lost control",
  'cannot maneuver',
  'cannot manoeuvre',
  'unable to steer',
];

const RESTORED = [
  'full maneuverability',
  'full manoeuvrability',
  'full control again',
  'maneuverability restored',
  'we have control again',
  'we have full control',
  'steering restored',
];

const RECOVERY = [
  'engines are responding',
  'engines responding again',
  'propulsion is recovering',
  'propulsion recovering',
];

const AMBIGUOUS = [
  'engine problems',
  'engine problem',
  'engine trouble',
  'engine issue',
  'something wrong with the engine',
  'propulsion problem',
  'mechanical problem',
];

export const interpretLocally = (
  text: string,
  pendingClarification?: string | null
): VesselAgentResponse => {
  const haystack = normalize(text);

  const lost: VesselAgentResponse = {
    message: 'I understood that maneuverability has been lost. Report this emergency to SOGN SAFE?',
    intent: 'MANEUVERABILITY_LOST',
    confidence: 0.94,
    proposedEvent: { type: 'VESSEL_EMERGENCY_TRIGGERED', incidentType: 'MANEUVERABILITY_LOST' },
    requiresConfirmation: true,
    usedFallback: true,
    speak: true,
  };

  if (pendingClarification === 'AMBIGUOUS_ENGINE') {
    if (includesAny(haystack, ['no', 'unable', 'cannot', 'nei'])) {
      return lost;
    }
    if (includesAny(haystack, ['yes', 'we can', 'still able', 'ja'])) {
      return {
        message: 'Understood. Maneuverability is still available. I will not raise an emergency from that report.',
        intent: 'STATUS_UPDATE',
        confidence: 0.72,
        proposedEvent: { type: 'VESSEL_STATUS_UPDATED', incidentType: 'STATUS_UPDATE' },
        requiresConfirmation: true,
        usedFallback: true,
        speak: true,
      };
    }
  }

  if (includesAny(haystack, EMERGENCY)) {
    return lost;
  }
  if (includesAny(haystack, RESTORED)) {
    return {
      message: 'I understood: maneuverability restored. Send this update to SOGN SAFE Platform?',
      intent: 'MANEUVERABILITY_RESTORED',
      confidence: 0.93,
      proposedEvent: { type: 'VESSEL_MANEUVERABILITY_RESTORED', incidentType: 'MANEUVERABILITY_RESTORED' },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    };
  }
  if (includesAny(haystack, RECOVERY)) {
    return {
      message: 'I understood that propulsion is recovering. Send this update?',
      intent: 'RECOVERY',
      confidence: 0.9,
      proposedEvent: { type: 'VESSEL_RECOVERY_REPORTED', incidentType: 'PROPULSION_RECOVERING' },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    };
  }
  if (includesAny(haystack, AMBIGUOUS)) {
    return {
      message: 'Are you still able to maneuver the vessel?',
      intent: 'CLARIFY',
      confidence: 0.62,
      proposedEvent: null,
      requiresConfirmation: false,
      clarification: 'AMBIGUOUS_ENGINE',
      usedFallback: true,
      speak: true,
    };
  }

  return {
    message:
      'I did not identify a critical vessel condition. You can describe what is happening, or report a training emergency manually.',
    intent: 'UNKNOWN',
    confidence: 0.35,
    proposedEvent: null,
    requiresConfirmation: false,
    usedFallback: true,
    speak: true,
  };
};
