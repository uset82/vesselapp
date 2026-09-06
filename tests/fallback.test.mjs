import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { classifyCaptainText, interpretWithFallback } = require('../shared/fallback.js');

const cases = [
  ['We have lost maneuverability.', 'MANEUVERABILITY_LOST'],
  ['We lost manoeuvrability.', 'MANEUVERABILITY_LOST'],
  ['We cannot steer.', 'MANEUVERABILITY_LOST'],
  ['We have lost steering.', 'MANEUVERABILITY_LOST'],
  ['Ship is not responding.', 'MANEUVERABILITY_LOST'],
  ['The engines are responding again.', 'RECOVERY'],
  ['We have full maneuverability again.', 'MANEUVERABILITY_RESTORED'],
  ['We have full control again.', 'MANEUVERABILITY_RESTORED'],
  ['We have engine problems.', 'AMBIGUOUS_ENGINE'],
];

for (const [message, intent] of cases) {
  assert.equal(classifyCaptainText(message), intent, message);
}

const emergency = interpretWithFallback('We have lost maneuverability.');
assert.equal(emergency.intent, 'MANEUVERABILITY_LOST');
assert.equal(emergency.requiresConfirmation, true);
assert.equal(emergency.proposedEvent.type, 'VESSEL_EMERGENCY_TRIGGERED');
assert.equal(emergency.usedFallback, true);

const clarify = interpretWithFallback('We have engine problems.');
assert.equal(clarify.intent, 'CLARIFY');
assert.equal(clarify.proposedEvent, null);

const afterNo = interpretWithFallback('No.', 'AMBIGUOUS_ENGINE');
assert.equal(afterNo.intent, 'MANEUVERABILITY_LOST');
assert.equal(afterNo.requiresConfirmation, true);

const afterYes = interpretWithFallback('Yes.', 'AMBIGUOUS_ENGINE');
assert.equal(afterYes.intent, 'STATUS_UPDATE');
assert.notEqual(afterYes.proposedEvent?.type, 'VESSEL_EMERGENCY_TRIGGERED');

const unknown = interpretWithFallback('What is the weather?');
assert.equal(unknown.intent, 'UNKNOWN');
assert.equal(unknown.requiresConfirmation, false);

console.log('fallback: 14/14 passed');
