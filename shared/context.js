const { createDemoVesselContext } = require('./demoVessel');

const buildVesselAgentContext = (vessel, extras = {}) => {
  const base = vessel && typeof vessel === 'object' ? vessel : createDemoVesselContext();
  const position = base.position || {};

  return {
    vesselId: base.vesselId,
    vesselName: base.vesselName,
    vesselType: base.vesselType,
    scenarioId: base.scenarioId || 'FJORDVIK_VESSEL_01',
    position: {
      latitude: position.latitude,
      longitude: position.longitude,
    },
    speedKnots: base.speedKnots,
    headingDegrees: base.headingDegrees,
    maneuverabilityStatus: base.maneuverabilityStatus,
    propulsionStatus: base.propulsionStatus,
    fireStatus: base.fireStatus || 'NONE',
    platformConnection: base.platformConnection,
    activeIncidentId: base.activeIncidentId || null,
    trainingMode: base.trainingMode !== false,
    captainId: base.captainId || 'CAPTAIN_DEMO',
    latestConfirmedReports: extras.latestConfirmedReports || [],
    pendingClarification: extras.pendingClarification || null,
    updatedAt: base.updatedAt || new Date().toISOString(),
  };
};

module.exports = {
  buildVesselAgentContext,
};
