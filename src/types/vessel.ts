export type VesselManeuverabilityStatus =
  | 'NORMAL'
  | 'REDUCED'
  | 'LOST'
  | 'RECOVERING'
  | 'RESTORED'
  | 'UNKNOWN';

export type VesselPropulsionStatus =
  | 'NORMAL'
  | 'DEGRADED'
  | 'FAILED'
  | 'RECOVERING'
  | 'RESTORED'
  | 'UNKNOWN';

export type VesselFireStatus = 'NONE' | 'ACTIVE' | 'CONTAINED' | 'UNKNOWN';

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING';

export type CaptainInteractionState =
  | 'IDLE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'UNDERSTANDING'
  | 'CONFIRMATION_REQUIRED'
  | 'REPORTING'
  | 'REPORTED'
  | 'ERROR';

export interface VesselPosition {
  latitude: number;
  longitude: number;
}

export interface VesselContext {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  scenarioId: string;
  position: VesselPosition;
  speedKnots: number;
  headingDegrees: number;
  maneuverabilityStatus: VesselManeuverabilityStatus;
  propulsionStatus: VesselPropulsionStatus;
  fireStatus: VesselFireStatus;
  platformConnection: ConnectionStatus;
  activeIncidentId?: string | null;
  trainingMode: boolean;
  captainId: string;
  captainLabel: string;
  updatedAt: string;
}

export interface PlatformAcknowledgement {
  acknowledged: boolean;
  eventId?: string;
  incidentId?: string | null;
  platformStatus?: string;
  duplicate?: boolean;
  error?: string;
}

export type HistoryActor = 'captain' | 'agent' | 'platform' | 'system';

export interface HistoryEntry {
  id: string;
  actor: HistoryActor;
  text: string;
  timestamp: string;
}
