let agentModulePromise = null;

const loadAgentModule = () => {
  if (!agentModulePromise) {
    agentModulePromise = import('./openrouterAgent.mjs').catch((error) => {
      agentModulePromise = null;
      throw error;
    });
  }
  return agentModulePromise;
};

const askVesselAgentWithSdk = async (payload) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return null;
  }
  const agent = await loadAgentModule();
  return agent.askVesselAgent(payload);
};

const speakWithSdk = async (text, language) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return null;
  }
  const agent = await loadAgentModule();
  return agent.synthesizeSpeech(text, language);
};

const describeModels = async () => {
  try {
    const agent = await loadAgentModule();
    return {
      chat: agent.getChatModels(),
      tts: agent.getTtsModels(),
    };
  } catch {
    return {
      chat: ['minimax/minimax-m3:free', 'thinkingmachines/inkling:free', 'openrouter/free'],
      tts: ['deepgram/flux-tts:free', 'fish-audio/s2.1-pro-free:free'],
    };
  }
};

module.exports = {
  askVesselAgentWithSdk,
  speakWithSdk,
  describeModels,
};
