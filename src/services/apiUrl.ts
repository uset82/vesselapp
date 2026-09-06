import { Platform } from 'react-native';
import Constants from 'expo-constants';

const fromHost = (port: number): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:${port}`;
    }
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:${port}`;
  }
  return `http://localhost:${port}`;
};

const deployedOrigin = (): string | null => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin;
    }
  }
  return null;
};

export const getPlatformUrl = (): string =>
  (process.env.EXPO_PUBLIC_PLATFORM_URL || deployedOrigin() || fromHost(4000)).replace(/\/$/, '');

export const getAgentUrl = (): string =>
  (process.env.EXPO_PUBLIC_AGENT_URL || deployedOrigin() || fromHost(4001)).replace(/\/$/, '');
