export type VesselIntent =
  | 'GENERAL_MESSAGE'
  | 'STATUS_UPDATE'
  | 'MANEUVERABILITY_REDUCED'
  | 'MANEUVERABILITY_LOST'
  | 'PROPULSION_FAILURE'
  | 'RECOVERY'
  | 'MANEUVERABILITY_RESTORED'
  | 'FIRE_ONBOARD'
  | 'EMERGENCY'
  | 'UNKNOWN'
  | 'CLARIFY';

export interface ProposedEvent {
  type: string;
  incidentType: string;
}

export interface VesselAgentResponse {
  message: string;
  intent: VesselIntent;
  confidence: number;
  proposedEvent: ProposedEvent | null;
  requiresConfirmation: boolean;
  clarification?: string | null;
  usedFallback: boolean;
  speak: boolean;
}

export interface ConversationTurn {
  id: string;
  role: 'captain' | 'agent' | 'platform' | 'system';
  text: string;
  timestamp: string;
  source: 'typed' | 'apple-speech' | 'whisper' | 'system';
}

export interface PendingInterpretation {
  response: VesselAgentResponse;
  captainText: string;
}
