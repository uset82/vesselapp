const { invokeVesselApi } = require('../shared/httpHandler');

module.exports = async (req, res) => invokeVesselApi(req, res, '/api/health');

module.exports.config = {
  maxDuration: 30,
};
