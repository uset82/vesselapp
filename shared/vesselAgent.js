const { interpretWithFallback } = require('./fallback');
const { buildVesselAgentContext } = require('./context');
const { askVesselAgentWithSdk } = require('./openRouterBridge');
const { SYSTEM_PROMPT } = require('./agentPrompt');

const interpretCaptainMessage = async ({ message, vessel, conversation, pendingClarification }) => {
  const context = buildVesselAgentContext(vessel, {
    pendingClarification,
    latestConfirmedReports: vessel?.latestConfirmedReports || [],
  });
  const fallback = interpretWithFallback(message, pendingClarification);

  try {
    const modelResult = await askVesselAgentWithSdk({
      message,
      context,
      conversation,
      pendingClarification,
    });
    if (modelResult) {
      return { response: modelResult, context, source: modelResult.model || 'openrouter' };
    }
  } catch {
    console.log('[Vessel Agent] Agent SDK unavailable. Deterministic fallback used. No secret logged.');
  }

  return { response: fallback, context, source: 'fallback' };
};

module.exports = {
  SYSTEM_PROMPT,
  interpretCaptainMessage,
};
