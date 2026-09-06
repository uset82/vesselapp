import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { validateAgentResponse } = require('../shared/agentSchema.js');

const good = validateAgentResponse({
  message: 'I understood that maneuverability has been lost.',
  intent: 'VESSEL_EMERGENCY',
  confidence: 0.96,
  proposedEvent: {
    type: 'VESSEL_EMERGENCY_TRIGGERED',
    incidentType: 'MANEUVERABILITY_LOST',
  },
  requiresConfirmation: true,
});
assert.equal(good.intent, 'UNKNOWN');
assert.equal(good.proposedEvent.type, 'VESSEL_EMERGENCY_TRIGGERED');
assert.equal(good.requiresConfirmation, true);

const inventedEvent = validateAgentResponse({
  message: 'Alerting civilians now.',
  intent: 'EMERGENCY',
  proposedEvent: {
    type: 'PUBLIC_ALERT_ISSUED',
    incidentType: 'MANEUVERABILITY_LOST',
  },
  requiresConfirmation: true,
});
assert.equal(inventedEvent.proposedEvent, null);
assert.equal(inventedEvent.requiresConfirmation, false);

const inventedAction = validateAgentResponse({
  message: 'I will take helm control.',
  intent: 'EMERGENCY',
  proposedEvent: {
    type: 'ENGAGE_AUTOPILOT',
    incidentType: 'MANEUVERABILITY_LOST',
  },
});
assert.equal(inventedAction.proposedEvent, null);

const empty = validateAgentResponse({ message: '   ' });
assert.equal(empty, null);

console.log('agent-schema: 5/5 passed');
