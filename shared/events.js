const VESSEL_EVENT_TYPES = [
  'VESSEL_CONNECTED',
  'VESSEL_DISCONNECTED',
  'VESSEL_STATUS_UPDATED',
  'VESSEL_POSITION_UPDATED',
  'VESSEL_WARNING_REPORTED',
  'VESSEL_EMERGENCY_TRIGGERED',
  'VESSEL_EMERGENCY_CONFIRMED',
  'VESSEL_RECOVERY_REPORTED',
  'VESSEL_MANEUVERABILITY_RESTORED',
  'VESSEL_MESSAGE_SENT',
  'VESSEL_MESSAGE_RECEIVED',
  'DEMO_RESET',
];

const CRITICAL_EVENT_TYPES = [
  'VESSEL_EMERGENCY_TRIGGERED',
  'VESSEL_EMERGENCY_CONFIRMED',
  'VESSEL_RECOVERY_REPORTED',
  'VESSEL_MANEUVERABILITY_RESTORED',
];

const INCIDENT_TYPES = [
  'MANEUVERABILITY_LOST',
  'MANEUVERABILITY_REDUCED',
  'PROPULSION_FAILURE',
  'PROPULSION_RECOVERING',
  'MANEUVERABILITY_RESTORED',
  'FLOODING',
  'FIRE_ONBOARD',
  'FIRE_UNDER_CONTROL',
  'STATUS_UPDATE',
  'GENERAL',
];

const createId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const isIsoDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

const validateVesselEvent = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Event must be an object.' };
  }

  if (typeof payload.id !== 'string' || payload.id.trim().length < 4) {
    return { ok: false, error: 'Event id is required.' };
  }
  if (!VESSEL_EVENT_TYPES.includes(payload.type)) {
    return { ok: false, error: `Unknown event type: ${payload.type}` };
  }
  if (typeof payload.vesselId !== 'string' || !payload.vesselId.trim()) {
    return { ok: false, error: 'vesselId is required.' };
  }
  if (!isIsoDate(payload.timestamp)) {
    return { ok: false, error: 'timestamp must be an ISO date string.' };
  }
  if (payload.source !== 'VESSEL_APP') {
    return { ok: false, error: 'source must be VESSEL_APP.' };
  }
  if (!payload.payload || typeof payload.payload !== 'object') {
    return { ok: false, error: 'payload must be an object.' };
  }
  if (payload.incidentId != null && typeof payload.incidentId !== 'string') {
    return { ok: false, error: 'incidentId must be a string when present.' };
  }
  if (payload.trainingMode !== true && payload.trainingMode !== false) {
    return { ok: false, error: 'trainingMode must be a boolean.' };
  }

  if (payload.type === 'VESSEL_EMERGENCY_TRIGGERED') {
    const inner = payload.payload;
    if (
      inner.incidentType !== 'MANEUVERABILITY_LOST' &&
      inner.incidentType !== 'PROPULSION_FAILURE' &&
      inner.incidentType !== 'FLOODING' &&
      inner.incidentType !== 'FIRE_ONBOARD'
    ) {
      return { ok: false, error: 'Emergency incidentType is not allowed.' };
    }
    if (inner.reportedBy !== 'CAPTAIN') {
      return { ok: false, error: 'Emergency events must be reportedBy CAPTAIN.' };
    }
  }

  return { ok: true, event: payload };
};

const createVesselEvent = ({ type, vesselId, incidentId, payload, trainingMode }) => {
  const event = {
    id: createId('evt'),
    type,
    vesselId,
    incidentId: incidentId || undefined,
    timestamp: new Date().toISOString(),
    source: 'VESSEL_APP',
    trainingMode: trainingMode !== false,
    payload: payload || {},
  };
  const validated = validateVesselEvent(event);
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  return validated.event;
};

const emergencyFixtures = {
  maneuverabilityLost: {
    id: 'evt_fixture_emergency_01',
    type: 'VESSEL_EMERGENCY_TRIGGERED',
    vesselId: 'MS_FJORD_STAR',
    timestamp: '2026-09-06T12:41:00.000Z',
    source: 'VESSEL_APP',
    trainingMode: true,
    payload: {
      incidentType: 'MANEUVERABILITY_LOST',
      reportedBy: 'CAPTAIN',
      vesselName: 'MS Fjord Star',
      speedKnots: 8.4,
      headingDegrees: 127,
      position: { latitude: 60.8631, longitude: 7.1134 },
      scenarioId: 'FJORDVIK_VESSEL_01',
    },
  },
  maneuverabilityRestored: {
    id: 'evt_fixture_restore_01',
    type: 'VESSEL_MANEUVERABILITY_RESTORED',
    vesselId: 'MS_FJORD_STAR',
    incidentId: 'inc-fjordvik-2026-11',
    timestamp: '2026-09-06T12:48:00.000Z',
    source: 'VESSEL_APP',
    trainingMode: true,
    payload: {
      incidentType: 'MANEUVERABILITY_RESTORED',
      reportedBy: 'CAPTAIN',
      maneuverabilityStatus: 'RESTORED',
    },
  },
};

module.exports = {
  VESSEL_EVENT_TYPES,
  CRITICAL_EVENT_TYPES,
  INCIDENT_TYPES,
  createId,
  validateVesselEvent,
  createVesselEvent,
  emergencyFixtures,
};
