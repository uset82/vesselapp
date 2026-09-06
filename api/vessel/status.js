const { invokeVesselApi } = require('../../shared/httpHandler');

module.exports = async (req, res) => invokeVesselApi(req, res, '/api/vessel/status');

module.exports.config = {
  maxDuration: 30,
};
