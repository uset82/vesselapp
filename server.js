require('dotenv').config({ path: '.env.server' });
require('dotenv').config();

const http = require('http');
const { interpretCaptainMessage } = require('./shared/vesselAgent');
const { validateVesselEvent, createId } = require('./shared/events');
const { createDemoVesselContext } = require('./shared/demoVessel');
const { speakWithSdk, describeModels } = require('./shared/openRouterBridge');

const PORT = Number(process.env.PORT || 4001);
const PLATFORM_URL = (process.env.PLATFORM_URL || 'http://localhost:4000').replace(/\/$/, '');

const state = {
  vessel: createDemoVesselContext(),
  events: [],
  lastEmergencyId: null,
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });

const json = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
  });
  res.end(JSON.stringify(payload));
};

const forwardToPlatform = async (pathname, payload) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${PLATFORM_URL}${pathname}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  } finally {
    clearTimeout(timer);
  }
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    const models = await describeModels();
    json(res, 200, {
      ok: true,
      trainingMode: true,
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      models,
      platformUrl: PLATFORM_URL,
      vesselId: state.vessel.vesselId,
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/vessel/status') {
    json(res, 200, { vessel: state.vessel, lastEmergencyId: state.lastEmergencyId });
    return;
  }

  if (req.method === 'POST' && (pathname === '/api/agents/vessel' || pathname === '/api/agent/vessel')) {
    const body = await parseBody(req);
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';
    if (!message) {
      json(res, 400, { error: 'Missing message.' });
      return;
    }

    const result = await interpretCaptainMessage({
      message,
      vessel: body.context || state.vessel,
      conversation: body.conversation || [],
      pendingClarification: body.pendingClarification || null,
    });
    json(res, 200, result.response);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/audio/speech') {
    const body = await parseBody(req);
    const text = typeof body.text === 'string' ? body.text.slice(0, 400) : '';
    if (!text) {
      json(res, 400, { error: 'Missing text.' });
      return;
    }
    if (!process.env.OPENROUTER_API_KEY) {
      json(res, 503, { error: 'Speech unavailable.' });
      return;
    }
    try {
      const audio = await speakWithSdk(text, body.language === 'no' ? 'no' : 'en');
      if (!audio) {
        json(res, 502, { error: 'Speech provider unavailable.' });
        return;
      }
      json(res, 200, {
        audioBase64: audio.buffer.toString('base64'),
        mimeType: audio.contentType || 'audio/mpeg',
        model: audio.model,
      });
    } catch {
      json(res, 504, { error: 'Speech timeout or provider error.' });
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/vessel/events') {
    const body = await parseBody(req);
    const validated = validateVesselEvent(body);
    if (!validated.ok) {
      json(res, 400, { acknowledged: false, error: validated.error });
      return;
    }

    const event = validated.event;
    if (event.type === 'VESSEL_EMERGENCY_TRIGGERED' && state.lastEmergencyId) {
      json(res, 200, {
        acknowledged: true,
        duplicate: true,
        eventId: state.lastEmergencyId,
        incidentId: state.vessel.activeIncidentId,
      });
      return;
    }

    state.events.unshift(event);
    const forwarded = await forwardToPlatform('/api/vessel/events', event);
    if (!forwarded.ok) {
      json(res, 502, {
        acknowledged: false,
        eventId: event.id,
        error: 'Platform did not acknowledge the event.',
      });
      return;
    }

    const incidentId = forwarded.data.incidentId || forwarded.data.incident?.id || null;
    if (event.type === 'VESSEL_EMERGENCY_TRIGGERED') {
      state.lastEmergencyId = event.id;
      state.vessel.activeIncidentId = incidentId;
      state.vessel.maneuverabilityStatus = 'LOST';
    }
    if (event.type === 'VESSEL_RECOVERY_REPORTED') {
      state.vessel.propulsionStatus = 'RECOVERING';
    }
    if (event.type === 'VESSEL_MANEUVERABILITY_RESTORED') {
      state.vessel.maneuverabilityStatus = 'RESTORED';
    }
    if (event.type === 'DEMO_RESET') {
      state.vessel = createDemoVesselContext();
      state.lastEmergencyId = null;
      state.events = [];
    }

    json(res, 200, {
      acknowledged: true,
      eventId: event.id,
      incidentId,
      platform: forwarded.data,
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/vessel/reset') {
    state.vessel = createDemoVesselContext();
    state.lastEmergencyId = null;
    state.events = [];
    await forwardToPlatform('/api/vessel/reset', { vesselId: state.vessel.vesselId, requestId: createId('req') });
    json(res, 200, { ok: true, vessel: state.vessel });
    return;
  }

  json(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`[SOGN SAFE Vessel Agent] http://localhost:${PORT}`);
  console.log(`[Platform forward] ${PLATFORM_URL}`);
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
