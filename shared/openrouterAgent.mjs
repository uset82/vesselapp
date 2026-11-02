import { OpenRouter, stepCountIs, tool } from '@openrouter/agent';
import { createRequire } from 'module';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const { SYSTEM_PROMPT } = require('./agentPrompt.js');
const { interpretWithFallback } = require('./fallback.js');
const { validateAgentResponse } = require('./agentSchema.js');

const DEFAULT_CHAT_MODELS = [
  'minimax/minimax-m3:free',
  'thinkingmachines/inkling:free',
  'openrouter/free',
];

const DEFAULT_TTS_MODELS = ['deepgram/flux-tts:free', 'fish-audio/s2.1-pro-free:free'];

const parseModelList = (value, fallback) => {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }
  const list = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length ? list : fallback;
};

export const getChatModels = () => {
  const preferred = process.env.VESSEL_AGENT_MODEL?.trim();
  const list = parseModelList(process.env.VESSEL_AGENT_FALLBACK_MODELS, DEFAULT_CHAT_MODELS);
  if (!preferred) {
    return list;
  }
  return [preferred, ...list.filter((model) => model !== preferred)];
};

export const getTtsModels = () => parseModelList(process.env.VESSEL_TTS_MODELS, DEFAULT_TTS_MODELS);

const getApiKey = () => {
  const key = process.env.OPENROUTER_API_KEY;
  return typeof key === 'string' && key.trim() ? key.trim() : '';
};

const createClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  return new OpenRouter({
    apiKey,
    httpReferer: 'https://sognsafe.canner.app',
    appTitle: 'SOGN SAFE Vessel training prototype',
    timeoutMs: 8000,
  });
};

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(label || 'timeout')), ms);
    }),
  ]);

const parseModelJson = (content) => {
  if (typeof content !== 'string') {
    return null;
  }
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const toInputItems = (message, conversation) => [
  ...((conversation || []).slice(-6).map((turn) => ({
    role: turn.role === 'assistant' ? 'assistant' : 'user',
    content: String(turn.text || ''),
  }))),
  { role: 'user', content: String(message || '') },
];

export const askVesselAgent = async ({ message, context, conversation, pendingClarification }) => {
  const client = createClient();
  if (!client) {
    return null;
  }

  const models = getChatModels();
  const instructions = `${SYSTEM_PROMPT}\n\nVerified vessel context JSON: ${JSON.stringify(context || {})}`;
  const input = toInputItems(message, conversation);

  const contextTool = tool({
    name: 'get_vessel_context',
    description:
      'Return the current verified vessel state. Never invent position, speed, heading, connection, or incident IDs.',
    inputSchema: z.object({
      reason: z.string().describe('Why the current vessel state is needed'),
    }),
    execute: async () => context || {},
  });

  const phraseTool = tool({
    name: 'match_training_phrases',
    description:
      'Deterministic classroom matcher for known captain phrases such as lost maneuverability, cannot steer, fire onboard, engines responding, or full control again.',
    inputSchema: z.object({
      report: z.string().describe('The captain report to match'),
    }),
    execute: async ({ report }) => interpretWithFallback(report, pendingClarification || null),
  });

  const deadline = Date.now() + 2800;
  let lastError = null;

  for (const [index, model] of models.slice(0, 1).entries()) {
    const remaining = deadline - Date.now();
    if (remaining < 800) {
      break;
    }

    const attempts = [false];
    for (const useTools of attempts) {
      const attemptMs = Math.min(2500, Math.max(800, deadline - Date.now()));
      try {
        const result = client.callModel({
          model,
          instructions,
          input,
          temperature: 0.1,
          ...(useTools
            ? {
                tools: [contextTool, phraseTool],
                stopWhen: stepCountIs(3),
              }
            : {}),
        });
        const text = await withTimeout(result.getText(), attemptMs, 'openrouter-timeout');
        const parsed = validateAgentResponse(parseModelJson(text));
        if (parsed) {
          return { ...parsed, usedFallback: false, model, usedTools: useTools };
        }
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (lastError && process.env.AGENT_DEBUG === '1') {
    console.warn('[OpenRouter] All free chat models failed. Using deterministic fallback.');
  }
  return null;
};

const requestSpeech = async (model, text, voice) => {
  const apiKey = getApiKey();
  const payload = {
    model,
    input: text.slice(0, 400),
    response_format: 'mp3',
  };
  if (voice) {
    payload.voice = voice;
  }

  const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sognsafe.canner.app',
      'X-Title': 'SOGN SAFE Vessel training prototype',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    return null;
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return null;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 80) {
    return null;
  }
  return { buffer, contentType: contentType || 'audio/mpeg', model };
};

export const synthesizeSpeech = async (text, language) => {
  if (!getApiKey() || !text) {
    return null;
  }

  const models = getTtsModels();
  const voices = language === 'no' ? [undefined, 'nova'] : [undefined, 'alloy'];

  for (const model of models) {
    for (const voice of voices) {
      try {
        const audio = await requestSpeech(model, text, voice);
        if (audio) {
          return audio;
        }
      } catch {
        // Try the next free TTS model.
      }
    }
  }
  return null;
};
