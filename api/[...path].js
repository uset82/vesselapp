const { handleVesselApi, sendJson } = require('../shared/httpHandler');

module.exports = async (req, res) => {
  const handled = await handleVesselApi(req, res);
  if (!handled) {
    sendJson(res, 404, { error: 'Endpoint not found' });
  }
};

module.exports.config = {
  maxDuration: 30,
};
