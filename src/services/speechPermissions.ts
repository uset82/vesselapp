import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type SpeechPermissionState = 'granted' | 'denied' | 'restricted' | 'undetermined';

export const MIC_PERMISSION_COPY =
  'SOGN SAFE VESSEL uses the microphone so you can report what is happening without typing.';

export const SPEECH_PERMISSION_COPY =
  'Speech recognition turns your report into text. Typed reporting still works if you deny this.';

export const requestSpeechPermissions = async (): Promise<SpeechPermissionState> => {
  if (Platform.OS === 'web') {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return typeof window !== 'undefined' &&
        ((window as typeof window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition ||
          (window as typeof window & { SpeechRecognition?: unknown }).SpeechRecognition)
        ? 'granted'
        : 'denied';
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch {
      return 'denied';
    }
  }

  try {
    const loaded = require('expo-speech-recognition') as {
      ExpoSpeechRecognitionModule?: {
        requestPermissionsAsync: () => Promise<{ granted: boolean; restricted?: boolean; canAskAgain?: boolean }>;
      };
    };
    const native = loaded.ExpoSpeechRecognitionModule;
    if (native) {
      const result = await native.requestPermissionsAsync();
      if (result.granted) {
        return 'granted';
      }
      if (result.restricted) {
        return 'restricted';
      }
      return result.canAskAgain === false ? 'restricted' : 'denied';
    }
  } catch {
    // Expo Go or missing native module.
  }

  try {
    const result = await Audio.requestPermissionsAsync();
    if (result.granted) {
      return 'granted';
    }
    return result.canAskAgain === false ? 'restricted' : 'denied';
  } catch {
    return 'denied';
  }
};
