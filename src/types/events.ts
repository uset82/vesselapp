export const VESSEL_EVENT_TYPES = [
  'VESSEL_CONNECTED',
  'VESSEL_DISCONNECTED',
  'VESSEL_STATUS_UPDATED',
  'VESSEL_POSITION_UPDATED',
  'VESSEL_WARNING_REPORTED',
  'VESSEL_EMERGENCY_TRIGGERED',
  'VESSEL_EMERGENCY_CONFIRMED',
  'VESSEL_RECOVERY_REPORTED',
  'VESSEL_MANEUVERABILITY_RESTORED',
  'VESSEL_MESSAGE_SENT',
  'VESSEL_MESSAGE_RECEIVED',
  'DEMO_RESET',
] as const;

export type VesselEventType = (typeof VESSEL_EVENT_TYPES)[number];

export interface VesselEvent<T extends object = Record<string, unknown>> {
  id: string;
  type: VesselEventType;
  vesselId: string;
  incidentId?: string;
  timestamp: string;
  source: 'VESSEL_APP';
  trainingMode: boolean;
  payload: T;
}

export interface EmergencyPayload {
  incidentType: 'MANEUVERABILITY_LOST' | 'PROPULSION_FAILURE';
  reportedBy: 'CAPTAIN';
  vesselName: string;
  speedKnots: number;
  headingDegrees: number;
  position: { latitude: number; longitude: number };
  scenarioId: string;
}
