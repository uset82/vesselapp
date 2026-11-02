import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildVesselAgentContext } = require('../shared/context.js');
const { createDemoVesselContext } = require('../shared/demoVessel.js');

const vessel = createDemoVesselContext();
const context = buildVesselAgentContext(vessel, {
  latestConfirmedReports: ['Vessel connected'],
});

assert.equal(context.vesselId, 'MS_FJORD_STAR');
assert.equal(context.vesselName, 'MS Fjord Star');
assert.equal(context.trainingMode, true);
assert.equal(context.maneuverabilityStatus, 'NORMAL');
assert.equal(context.propulsionStatus, 'NORMAL');
assert.equal(context.fireStatus, 'NONE');
assert.equal(context.platformConnection, 'CONNECTED');
assert.equal(context.activeIncidentId, null);
assert.equal(context.speedKnots, 8.4);
assert.equal(context.headingDegrees, 127);
assert.ok(context.position.latitude > 60);
assert.ok(context.position.longitude > 7);
assert.deepEqual(context.latestConfirmedReports, ['Vessel connected']);

console.log('context: 12/12 passed');
