const { invokeVesselApi } = require('../shared/httpHandler');

module.exports = async (req, res) => invokeVesselApi(req, res);

module.exports.config = {
  maxDuration: 30,
};
