const DEMO_VESSEL = {
  vesselId: 'MS_FJORD_STAR',
  vesselName: 'MS Fjord Star',
  vesselType: 'Passenger Vessel',
  scenarioId: 'FLAM_VESSEL_01',
  position: {
    latitude: 60.8631,
    longitude: 7.1134,
  },
  speedKnots: 8.4,
  headingDegrees: 127,
  maneuverabilityStatus: 'NORMAL',
  propulsionStatus: 'NORMAL',
  platformConnection: 'CONNECTED',
  activeIncidentId: null,
  trainingMode: true,
  captainId: 'CAPTAIN_DEMO',
  captainLabel: 'Captain (training)',
};

const createDemoVesselContext = () => ({
  ...DEMO_VESSEL,
  position: { ...DEMO_VESSEL.position },
  updatedAt: new Date().toISOString(),
});

module.exports = {
  DEMO_VESSEL,
  createDemoVesselContext,
};
