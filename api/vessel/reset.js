const { invokeVesselApi } = require('../../shared/httpHandler');

module.exports = async (req, res) => invokeVesselApi(req, res, '/api/vessel/reset');

module.exports.config = {
  maxDuration: 30,
};
