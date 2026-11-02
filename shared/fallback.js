const { validateAgentResponse } = require('./agentSchema');

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9æøåäöüé\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesAny = (haystack, phrases) => phrases.some((phrase) => haystack.includes(phrase));

const EMERGENCY_PHRASES = [
  'lost maneuverability',
  'lost manoeuvrability',
  'lost manouverability',
  'cannot steer',
  'can not steer',
  "can't steer",
  'lost steering',
  'no steering',
  'steering failure',
  'ship is not responding',
  'vessel is not responding',
  'not responding to helm',
  'not responding to rudder',
  'we have lost control',
  "we've lost control",
  'lost control of the ship',
  'cannot maneuver',
  'cannot manoeuvre',
  "can't maneuver",
  "can't manoeuvre",
  'unable to maneuver',
  'unable to manoeuvre',
  'unable to steer',
];

const RESTORED_PHRASES = [
  'full maneuverability',
  'full manoeuvrability',
  'full control again',
  'maneuverability restored',
  'manoeuvrability restored',
  'steering restored',
  'we have control again',
  "we've got control again",
  'we have full control',
  'rudder responding',
  'helm is responding',
];

const RECOVERY_PHRASES = [
  'engines are responding',
  'engines responding again',
  'engine is responding',
  'propulsion is recovering',
  'propulsion recovering',
  'recovering propulsion',
  'engines coming back',
  'power is coming back',
];

const SINKING_PHRASES = [
  'we are sinking',
  "we're sinking",
  'we re sinking',
  'vessel is sinking',
  'ship is sinking',
  'the ship is sinking',
  'the vessel is sinking',
  'taking on water',
  'taking in water',
  'we are flooding',
  "we're flooding",
  'flooding',
  'going down',
  'we are syncing',
  "we're syncing",
  'we are sinkin',
  "we're sinkin",
];

const SINKING_STT_PHRASES = [
  'we are thinking',
  "we're thinking",
  'we re thinking',
  'were thinking',
  'we thinking',
];

const AMBIGUOUS_PHRASES = [
  'engine problems',
  'engine problem',
  'engine trouble',
  'engine issue',
  'problems with the engine',
  'problem with the engine',
  'something wrong with the engine',
  'something wrong with the engines',
  'propulsion problem',
  'mechanical problem',
  'mechanical issues',
  'we have a problem',
  'technical problem',
];

const YES_PHRASES = ['yes', 'yes we can', 'we can', 'still able', 'affirmative', 'ja'];
const NO_PHRASES = ['no', 'no we cannot', 'we cannot', 'unable', 'negative', 'nei'];

const classifyCaptainText = (text, pendingIntent) => {
  const haystack = normalize(text);
  if (!haystack) {
    return 'UNKNOWN';
  }

  if (pendingIntent === 'AMBIGUOUS_ENGINE') {
    if (includesAny(haystack, NO_PHRASES) || includesAny(haystack, EMERGENCY_PHRASES)) {
      return 'MANEUVERABILITY_LOST';
    }
    if (includesAny(haystack, YES_PHRASES)) {
      return 'STATUS_UPDATE';
    }
  }

  if (pendingIntent === 'CLARIFY_SINKING') {
    if (includesAny(haystack, SINKING_PHRASES) || includesAny(haystack, ['yes', 'ja', 'correct', 'sinking'])) {
      return 'SINKING';
    }
    if (includesAny(haystack, ['no', 'nei', 'not sinking'])) {
      return 'UNKNOWN';
    }
  }

  if (includesAny(haystack, SINKING_PHRASES)) {
    return 'SINKING';
  }
  if (includesAny(haystack, SINKING_STT_PHRASES)) {
    return 'CLARIFY_SINKING';
  }
  if (includesAny(haystack, EMERGENCY_PHRASES)) {
    return 'MANEUVERABILITY_LOST';
  }
  if (includesAny(haystack, RESTORED_PHRASES)) {
    return 'MANEUVERABILITY_RESTORED';
  }
  if (includesAny(haystack, RECOVERY_PHRASES)) {
    return 'RECOVERY';
  }
  if (includesAny(haystack, AMBIGUOUS_PHRASES)) {
    return 'AMBIGUOUS_ENGINE';
  }
  return 'UNKNOWN';
};

const interpretWithFallback = (text, pendingIntent) => {
  const classified = classifyCaptainText(text, pendingIntent);

  if (classified === 'SINKING') {
    return validateAgentResponse({
      message: 'I understood: the vessel is sinking. Report this emergency to SOGN SAFE?',
      intent: 'EMERGENCY',
      confidence: 0.93,
      proposedEvent: {
        type: 'VESSEL_EMERGENCY_TRIGGERED',
        incidentType: 'FLOODING',
      },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    });
  }

  if (classified === 'CLARIFY_SINKING') {
    return validateAgentResponse({
      message: 'Did you report that the vessel is sinking? Say sinking, or type We are sinking.',
      intent: 'CLARIFY',
      confidence: 0.58,
      proposedEvent: null,
      requiresConfirmation: false,
      clarification: 'CLARIFY_SINKING',
      usedFallback: true,
      speak: true,
    });
  }

  if (classified === 'MANEUVERABILITY_LOST') {
    return validateAgentResponse({
      message: 'I understood that maneuverability has been lost. Report this emergency to SOGN SAFE?',
      intent: 'MANEUVERABILITY_LOST',
      confidence: 0.94,
      proposedEvent: {
        type: 'VESSEL_EMERGENCY_TRIGGERED',
        incidentType: 'MANEUVERABILITY_LOST',
      },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    });
  }

  if (classified === 'MANEUVERABILITY_RESTORED') {
    return validateAgentResponse({
      message: 'I understood: maneuverability restored. Send this update to SOGN SAFE Platform?',
      intent: 'MANEUVERABILITY_RESTORED',
      confidence: 0.93,
      proposedEvent: {
        type: 'VESSEL_MANEUVERABILITY_RESTORED',
        incidentType: 'MANEUVERABILITY_RESTORED',
      },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    });
  }

  if (classified === 'RECOVERY') {
    return validateAgentResponse({
      message: 'I understood that propulsion is recovering. Send this update?',
      intent: 'RECOVERY',
      confidence: 0.9,
      proposedEvent: {
        type: 'VESSEL_RECOVERY_REPORTED',
        incidentType: 'PROPULSION_RECOVERING',
      },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    });
  }

  if (classified === 'AMBIGUOUS_ENGINE') {
    return validateAgentResponse({
      message: 'Are you still able to maneuver the vessel?',
      intent: 'CLARIFY',
      confidence: 0.62,
      proposedEvent: null,
      requiresConfirmation: false,
      clarification: 'AMBIGUOUS_ENGINE',
      usedFallback: true,
      speak: true,
    });
  }

  if (classified === 'STATUS_UPDATE') {
    return validateAgentResponse({
      message: 'Understood. Maneuverability is still available. I will not raise an emergency from that report.',
      intent: 'STATUS_UPDATE',
      confidence: 0.72,
      proposedEvent: {
        type: 'VESSEL_STATUS_UPDATED',
        incidentType: 'STATUS_UPDATE',
      },
      requiresConfirmation: true,
      usedFallback: true,
      speak: true,
    });
  }

  return validateAgentResponse({
    message: 'I did not identify a critical vessel condition. You can describe what is happening, or report a training emergency manually.',
    intent: 'UNKNOWN',
    confidence: 0.35,
    proposedEvent: null,
    requiresConfirmation: false,
    usedFallback: true,
    speak: true,
  });
};

module.exports = {
  normalize,
  classifyCaptainText,
  interpretWithFallback,
  EMERGENCY_PHRASES,
  SINKING_PHRASES,
  RESTORED_PHRASES,
  RECOVERY_PHRASES,
};
