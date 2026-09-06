const { interpretCaptainMessage } = require('./vesselAgent');
const { validateVesselEvent, createId } = require('./events');
const { createDemoVesselContext } = require('./demoVessel');
const { speakWithSdk, describeModels } = require('./openRouterBridge');

const platformUrl = () => (process.env.PLATFORM_URL || '').replace(/\/$/, '');

const canForwardToPlatform = () => {
  const url = platformUrl();
  return Boolean(url) && !/localhost|127\.0\.0\.1/i.test(url);
};

const state = {
  vessel: createDemoVesselContext(),
  events: [],
  lastEmergencyId: null,
};

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
};

const sendJson = (res, status, payload) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
  res.statusCode = status;
  res.end(JSON.stringify(payload));
};

const forwardToPlatform = async (pathname, payload) => {
  if (!canForwardToPlatform()) {
    return { ok: false, skipped: true, data: null };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${platformUrl()}${pathname}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, error: error.message, data: null };
  } finally {
    clearTimeout(timer);
  }
};

const normalizeApiPath = (req, forcedPath) => {
  if (forcedPath) {
    return String(forcedPath).replace(/\/+$/, '') || '/';
  }
  const host = req.headers.host || 'localhost';
  let pathname = '/';
  try {
    pathname = new URL(req.url, `http://${host}`).pathname;
  } catch {
    pathname = String(req.url || '/').split('?')[0];
  }
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean.startsWith('/api/') || clean === '/api') {
    return clean;
  }
  return `/api${clean.startsWith('/') ? clean : `/${clean}`}`;
};

const handleVesselApi = async (req, res, forcedPath) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const pathname = normalizeApiPath(req, forcedPath);

  if (req.method === 'GET' && pathname === '/api/health') {
    const models = await describeModels();
    sendJson(res, 200, {
      ok: true,
      trainingMode: true,
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      models,
      platformUrl: platformUrl() || null,
      vesselId: state.vessel.vesselId,
    });
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/vessel/status') {
    sendJson(res, 200, {
      connected: true,
      vessel: state.vessel,
      lastEmergencyId: state.lastEmergencyId,
      incident: state.vessel.activeIncidentId ? { id: state.vessel.activeIncidentId, status: 'ACTIVE' } : null,
      hasActiveIncident: Boolean(state.vessel.activeIncidentId),
    });
    return true;
  }

  if (req.method === 'POST' && (pathname === '/api/agents/vessel' || pathname === '/api/agent/vessel')) {
    const body = await readJsonBody(req);
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';
    if (!message) {
      sendJson(res, 400, { error: 'Missing message.' });
      return true;
    }
    const result = await interpretCaptainMessage({
      message,
      vessel: body.context || state.vessel,
      conversation: body.conversation || [],
      pendingClarification: body.pendingClarification || null,
    });
    sendJson(res, 200, result.response);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/audio/speech') {
    const body = await readJsonBody(req);
    const text = typeof body.text === 'string' ? body.text.slice(0, 400) : '';
    if (!text) {
      sendJson(res, 400, { error: 'Missing text.' });
      return true;
    }
    if (!process.env.OPENROUTER_API_KEY) {
      sendJson(res, 503, { error: 'Speech unavailable.' });
      return true;
    }
    try {
      const audio = await speakWithSdk(text, body.language === 'no' ? 'no' : 'en');
      if (!audio) {
        sendJson(res, 502, { error: 'Speech provider unavailable.' });
        return true;
      }
      sendJson(res, 200, {
        audioBase64: audio.buffer.toString('base64'),
        mimeType: audio.contentType || 'audio/mpeg',
        model: audio.model,
      });
    } catch {
      sendJson(res, 504, { error: 'Speech timeout or provider error.' });
    }
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/vessel/events') {
    const body = await readJsonBody(req);
    const validated = validateVesselEvent(body);
    if (!validated.ok) {
      sendJson(res, 400, { acknowledged: false, error: validated.error });
      return true;
    }

    const event = validated.event;
    if (event.type === 'VESSEL_EMERGENCY_TRIGGERED' && state.lastEmergencyId) {
      sendJson(res, 200, {
        acknowledged: true,
        duplicate: true,
        eventId: state.lastEmergencyId,
        incidentId: state.vessel.activeIncidentId,
      });
      return true;
    }

    state.events.unshift(event);
    const forwarded = await forwardToPlatform('/api/vessel/events', event);
    const incidentId =
      forwarded.data?.incidentId ||
      forwarded.data?.incident?.id ||
      (event.type === 'VESSEL_EMERGENCY_TRIGGERED' ? `inc-flam-${Date.now()}` : state.vessel.activeIncidentId);

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

    sendJson(res, 200, {
      acknowledged: true,
      eventId: event.id,
      incidentId,
      platformStatus: forwarded.ok ? forwarded.data?.platformStatus || 'ACTIVE' : 'RECEIVED',
      platformForwarded: Boolean(forwarded.ok),
    });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/vessel/reset') {
    state.vessel = createDemoVesselContext();
    state.lastEmergencyId = null;
    state.events = [];
    await forwardToPlatform('/api/vessel/reset', { vesselId: state.vessel.vesselId, requestId: createId('req') });
    sendJson(res, 200, { ok: true, vessel: state.vessel });
    return true;
  }

  return false;
};

const invokeVesselApi = async (req, res, forcedPath) => {
  const handled = await handleVesselApi(req, res, forcedPath);
  if (!handled) {
    sendJson(res, 404, { error: 'Endpoint not found' });
  }
};

module.exports = {
  handleVesselApi,
  invokeVesselApi,
  sendJson,
};
