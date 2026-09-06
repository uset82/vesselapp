const { invokeVesselApi } = require('../../shared/httpHandler');

module.exports = async (req, res) => invokeVesselApi(req, res, '/api/agents/vessel');

module.exports.config = {
  maxDuration: 30,
};
