require('dotenv').config({ path: '.env.server' });
require('dotenv').config();

const http = require('http');
const { handleVesselApi, sendJson } = require('./shared/httpHandler');
const { describeModels } = require('./shared/openRouterBridge');

const PORT = Number(process.env.PORT || 4001);

const server = http.createServer(async (req, res) => {
  const handled = await handleVesselApi(req, res);
  if (!handled) {
    sendJson(res, 404, { error: 'Endpoint not found' });
  }
});

server.listen(PORT, () => {
  console.log(`[SOGN SAFE Vessel Agent] http://localhost:${PORT}`);
  void describeModels().then((models) => {
    if (process.env.OPENROUTER_API_KEY) {
      console.log('[OpenRouter] Agent SDK ready. Key present (not logged).');
      console.log(`[OpenRouter] Chat: ${models.chat.join(', ')}`);
      console.log(`[OpenRouter] TTS: ${models.tts.join(', ')}`);
    } else {
      console.log('[OpenRouter] No API key. Deterministic fallback only.');
    }
  });
});
