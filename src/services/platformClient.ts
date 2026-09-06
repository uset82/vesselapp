import { VesselEvent } from '../types/events';
import { PlatformAcknowledgement } from '../types/vessel';
import { getPlatformUrl } from './apiUrl';

export type PlatformConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING';

const request = async (
  pathname: string,
  init: RequestInit = {},
  timeoutMs = 8000
): Promise<{ ok: boolean; data: any }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${getPlatformUrl()}${pathname}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: null };
  } finally {
    clearTimeout(timer);
  }
};

export const connectToPlatform = async (vesselId: string): Promise<boolean> => {
  const event = {
    id: `evt_connect_${Date.now()}`,
    type: 'VESSEL_CONNECTED',
    vesselId,
    timestamp: new Date().toISOString(),
    source: 'VESSEL_APP',
    trainingMode: true,
    payload: { vesselId },
  };
  const result = await request('/api/vessel/events', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: { 'X-Request-Id': event.id },
  });
  return result.ok && result.data?.acknowledged !== false;
};

export const fetchPlatformStatus = async (): Promise<{
  connected: boolean;
  incidentId: string | null;
  platformStatus: string | null;
} | null> => {
  const result = await request('/api/vessel/status', { method: 'GET' }, 5000);
  if (!result.ok) {
    return null;
  }
  return {
    connected: Boolean(result.data.connected || result.data.hasActiveIncident !== undefined),
    incidentId: result.data.incident?.id || null,
    platformStatus: result.data.incident?.status || (result.data.hasActiveIncident ? 'ACTIVE' : 'STANDBY'),
  };
};

export const sendVesselEvent = async (event: VesselEvent): Promise<PlatformAcknowledgement> => {
  const result = await request('/api/vessel/events', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: { 'X-Request-Id': event.id },
  });
  if (!result.ok) {
    return { acknowledged: false, eventId: event.id, error: 'Platform did not acknowledge the event.' };
  }
  return {
    acknowledged: Boolean(result.data.acknowledged),
    eventId: result.data.eventId || event.id,
    incidentId: result.data.incidentId || result.data.incident?.id || null,
    platformStatus: result.data.platformStatus,
    duplicate: Boolean(result.data.duplicate),
  };
};

export const resetPlatformScenario = async (vesselId: string): Promise<boolean> => {
  const result = await request('/api/vessel/reset', {
    method: 'POST',
    body: JSON.stringify({ vesselId }),
  });
  return result.ok;
};
