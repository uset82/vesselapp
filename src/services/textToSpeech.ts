import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { requestAgentSpeech } from './agentClient';

const voiceLocale = (language: 'en' | 'no'): string => (language === 'no' ? 'nb-NO' : 'en-US');

export const stopSpeech = async (): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  try {
    await Speech.stop();
  } catch {
    // Already stopped.
  }
};

export const speakText = async (text: string, language: 'en' | 'no' = 'en'): Promise<void> => {
  const clean = text.trim();
  if (!clean) {
    return;
  }
  await stopSpeech();

  if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.speechSynthesis) {
    const remote = await requestAgentSpeech(clean, language);
    if (remote && typeof Audio !== 'undefined') {
      const bytes = Uint8Array.from(atob(remote.audioBase64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: remote.mimeType });
      const url = URL.createObjectURL(blob);
      const player = new Audio(url);
      await new Promise<void>((resolve) => {
        player.onended = () => resolve();
        player.onerror = () => resolve();
        void player.play().catch(() => resolve());
      });
      URL.revokeObjectURL(url);
      return;
    }
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    await new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = voiceLocale(language);
      utter.rate = 0.96;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
    return;
  }

  await new Promise<void>((resolve) => {
    Speech.speak(clean, {
      language: voiceLocale(language),
      rate: 0.96,
      pitch: 1,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
};
