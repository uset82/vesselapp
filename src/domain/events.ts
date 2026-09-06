import { EmergencyPayload, VesselEvent, VesselEventType } from '../types/events';
import { VesselContext } from '../types/vessel';

const createId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const createVesselEvent = <T extends object>(
  type: VesselEventType,
  vessel: VesselContext,
  payload: T,
  incidentId?: string | null
): VesselEvent<T> => ({
  id: createId('evt'),
  type,
  vesselId: vessel.vesselId,
  incidentId: incidentId || undefined,
  timestamp: new Date().toISOString(),
  source: 'VESSEL_APP',
  trainingMode: vessel.trainingMode,
  payload,
});

export const createEmergencyEvent = (vessel: VesselContext): VesselEvent<EmergencyPayload> =>
  createVesselEvent<EmergencyPayload>('VESSEL_EMERGENCY_TRIGGERED', vessel, {
    incidentType: 'MANEUVERABILITY_LOST',
    reportedBy: 'CAPTAIN',
    vesselName: vessel.vesselName,
    speedKnots: vessel.speedKnots,
    headingDegrees: vessel.headingDegrees,
    position: { ...vessel.position },
    scenarioId: vessel.scenarioId,
  });

export const nowClock = (): string =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
