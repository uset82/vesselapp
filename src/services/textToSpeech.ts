import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { requestAgentSpeech } from './agentClient';

const voiceLocale = (language: 'en' | 'no'): string => (language === 'no' ? 'nb-NO' : 'en-US');

type WebAudioWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

let webPlayer: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;

const isIosWeb = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const unlockWebPlayback = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const Ctor = window.AudioContext || (window as WebAudioWindow).webkitAudioContext;
    if (Ctor) {
      audioCtx = audioCtx ?? new Ctor();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
    }
  } catch {
    // AudioContext unlock is best-effort.
  }

  if (typeof Audio !== 'undefined') {
    webPlayer = webPlayer ?? new Audio();
    webPlayer.preload = 'auto';
    try {
      webPlayer.src =
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';
      await webPlayer.play().catch(() => undefined);
      webPlayer.pause();
    } catch {
      // Silent unlock is best-effort.
    }
  }

  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const priming = new SpeechSynthesisUtterance(' ');
      priming.volume = 0;
      priming.rate = 2;
      window.speechSynthesis.speak(priming);
      window.speechSynthesis.cancel();
    } catch {
      // SpeechSynthesis unlock is best-effort.
    }
  }
};

const playRemoteAudio = async (remote: { audioBase64: string; mimeType: string }): Promise<boolean> => {
  if (typeof Audio === 'undefined') {
    return false;
  }
  const bytes = Uint8Array.from(atob(remote.audioBase64), (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: remote.mimeType });
  const url = URL.createObjectURL(blob);
  const player = webPlayer ?? new Audio();
  webPlayer = player;
  player.src = url;
  try {
    await player.play();
    await new Promise<void>((resolve) => {
      player.onended = () => resolve();
      player.onerror = () => resolve();
    });
    return true;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const stopSpeech = async (): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (webPlayer) {
    webPlayer.pause();
    webPlayer.removeAttribute('src');
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

  if (Platform.OS === 'web') {
    const preferRemote = typeof window === 'undefined' || !window.speechSynthesis || isIosWeb();
    if (preferRemote) {
      const remote = await requestAgentSpeech(clean, language);
      if (remote && (await playRemoteAudio(remote))) {
        return;
      }
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
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

    const remote = await requestAgentSpeech(clean, language);
    if (remote) {
      await playRemoteAudio(remote);
    }
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
