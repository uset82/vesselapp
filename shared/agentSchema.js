const VESSEL_INTENTS = [
  'GENERAL_MESSAGE',
  'STATUS_UPDATE',
  'MANEUVERABILITY_REDUCED',
  'MANEUVERABILITY_LOST',
  'PROPULSION_FAILURE',
  'RECOVERY',
  'MANEUVERABILITY_RESTORED',
  'EMERGENCY',
  'UNKNOWN',
  'CLARIFY',
];

const ALLOWED_PROPOSED_EVENTS = [
  'VESSEL_STATUS_UPDATED',
  'VESSEL_WARNING_REPORTED',
  'VESSEL_EMERGENCY_TRIGGERED',
  'VESSEL_RECOVERY_REPORTED',
  'VESSEL_MANEUVERABILITY_RESTORED',
  'VESSEL_MESSAGE_SENT',
];

const ALLOWED_INCIDENT_TYPES = [
  'MANEUVERABILITY_LOST',
  'MANEUVERABILITY_REDUCED',
  'PROPULSION_FAILURE',
  'PROPULSION_RECOVERING',
  'MANEUVERABILITY_RESTORED',
  'FLOODING',
  'STATUS_UPDATE',
  'GENERAL',
];

const clampConfidence = (value) => {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, number));
};

const validateAgentResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message) {
    return null;
  }

  const intent = VESSEL_INTENTS.includes(payload.intent) ? payload.intent : 'UNKNOWN';
  let proposedEvent = payload.proposedEvent ?? null;
  if (proposedEvent && typeof proposedEvent === 'object') {
    if (!ALLOWED_PROPOSED_EVENTS.includes(proposedEvent.type)) {
      proposedEvent = null;
    } else if (proposedEvent.incidentType && !ALLOWED_INCIDENT_TYPES.includes(proposedEvent.incidentType)) {
      proposedEvent = null;
    } else {
      proposedEvent = {
        type: proposedEvent.type,
        incidentType: proposedEvent.incidentType || 'GENERAL',
      };
    }
  } else {
    proposedEvent = null;
  }

  const requiresConfirmation = Boolean(payload.requiresConfirmation) && Boolean(proposedEvent);

  return {
    message: message.slice(0, 280),
    intent,
    confidence: clampConfidence(payload.confidence),
    proposedEvent,
    requiresConfirmation,
    clarification: typeof payload.clarification === 'string' ? payload.clarification.slice(0, 180) : null,
    usedFallback: Boolean(payload.usedFallback),
    speak: payload.speak !== false,
  };
};

module.exports = {
  VESSEL_INTENTS,
  ALLOWED_PROPOSED_EVENTS,
  ALLOWED_INCIDENT_TYPES,
  validateAgentResponse,
};
