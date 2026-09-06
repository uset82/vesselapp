import { VesselContext } from '../types/vessel';

export const DEMO_VESSEL: VesselContext = {
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
  platformConnection: 'CONNECTING',
  activeIncidentId: null,
  trainingMode: true,
  captainId: 'CAPTAIN_DEMO',
  captainLabel: 'Captain (training)',
  updatedAt: new Date().toISOString(),
};

export const createDemoVessel = (): VesselContext => ({
  ...DEMO_VESSEL,
  position: { ...DEMO_VESSEL.position },
  platformConnection: 'CONNECTING',
  activeIncidentId: null,
  maneuverabilityStatus: 'NORMAL',
  propulsionStatus: 'NORMAL',
  updatedAt: new Date().toISOString(),
});
