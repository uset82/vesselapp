import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  validateVesselEvent,
  createVesselEvent,
  emergencyFixtures,
  VESSEL_EVENT_TYPES,
} = require('../shared/events.js');

assert.ok(VESSEL_EVENT_TYPES.includes('VESSEL_EMERGENCY_TRIGGERED'));

const valid = validateVesselEvent(emergencyFixtures.maneuverabilityLost);
assert.equal(valid.ok, true, valid.error);

const restored = validateVesselEvent(emergencyFixtures.maneuverabilityRestored);
assert.equal(restored.ok, true, restored.error);

const invented = validateVesselEvent({
  ...emergencyFixtures.maneuverabilityLost,
  type: 'ALERT_CIVILIANS',
});
assert.equal(invented.ok, false);

const badSource = validateVesselEvent({
  ...emergencyFixtures.maneuverabilityLost,
  source: 'MINIMAX',
});
assert.equal(badSource.ok, false);

const built = createVesselEvent({
  type: 'VESSEL_CONNECTED',
  vesselId: 'MS_FJORD_STAR',
  trainingMode: true,
  payload: { trainingMode: true },
});
assert.equal(built.source, 'VESSEL_APP');
assert.equal(validateVesselEvent(built).ok, true);

const fireEvent = validateVesselEvent({
  ...emergencyFixtures.maneuverabilityLost,
  payload: {
    ...emergencyFixtures.maneuverabilityLost.payload,
    incidentType: 'FIRE_ONBOARD',
  },
});
assert.equal(fireEvent.ok, true, 'FIRE_ONBOARD should be a valid emergency incidentType');

console.log('events: 7/7 passed');
