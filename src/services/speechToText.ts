import { Platform } from 'react-native';

export interface SpeechResult {
  text: string;
  provider: 'apple-speech' | 'web-speech' | 'none';
}

export interface SpeechToTextProvider {
  start: () => Promise<void>;
  stop: () => Promise<SpeechResult>;
  cancel: () => Promise<void>;
}

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>;
  }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

interface NativeSpeechModule {
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: { lang: string; interimResults: boolean; continuous: boolean; addsPunctuation: boolean }) => void;
  stop: () => void;
  abort: () => void;
  addListener: (event: string, listener: (payload: never) => void) => { remove: () => void };
}

interface ActiveSession {
  provider: SpeechResult['provider'];
  recognition?: InstanceType<RecognitionCtor>;
  chunks: string[];
  finalText: string;
  resolveStop?: (text: string) => void;
  subscriptions?: Array<{ remove: () => void }>;
}

let session: ActiveSession | null = null;
let onPartial: ((text: string) => void) | null = null;
let keepListening = false;

const getNativeSpeech = (): NativeSpeechModule | null => {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    const loaded = require('expo-speech-recognition') as { ExpoSpeechRecognitionModule?: NativeSpeechModule };
    return loaded.ExpoSpeechRecognitionModule ?? null;
  } catch {
    return null;
  }
};

const getWebRecognition = (): RecognitionCtor | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const speechWindow = window as typeof window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

const restartWebRecognition = (recognition: InstanceType<RecognitionCtor>): boolean => {
  if (!keepListening || !session) {
    return false;
  }
  try {
    recognition.start();
    return true;
  } catch {
    return false;
  }
};

export const startListening = async (callbacks: { onPartial?: (text: string) => void } = {}): Promise<void> => {
  onPartial = callbacks.onPartial ?? null;
  keepListening = true;
  const native = getNativeSpeech();
  if (native?.isRecognitionAvailable()) {
    const permission = await native.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Speech permission denied');
    }
    session = { provider: 'apple-speech', chunks: [], finalText: '', subscriptions: [] };
    session.subscriptions?.push(
      native.addListener('result', ((event: { results?: Array<{ transcript: string }>; isFinal?: boolean }) => {
        const first = event.results?.[0];
        if (!first) {
          return;
        }
        session?.chunks.push(first.transcript);
        onPartial?.(first.transcript);
        if (event.isFinal) {
          session!.finalText = first.transcript;
        }
      }) as (payload: never) => void)
    );
    session.subscriptions?.push(
      native.addListener('end', (() => {
        session?.resolveStop?.(session.finalText || session.chunks.at(-1) || '');
      }) as (payload: never) => void)
    );
    native.start({ lang: 'en-US', interimResults: true, continuous: true, addsPunctuation: true });
    return;
  }

  const Recognition = getWebRecognition();
  if (!Recognition) {
    throw new Error('Speech recognition unavailable');
  }
  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;
  session = { provider: 'web-speech', recognition, chunks: [], finalText: '' };
  recognition.onresult = (event) => {
    if (!session) {
      return;
    }
    let interim = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const piece = event.results[index];
      if (!piece) {
        continue;
      }
      const text = piece[0].transcript;
      if (piece.isFinal) {
        session.finalText = `${session.finalText} ${text}`.trim();
        session.chunks.push(text);
      } else {
        interim += text;
      }
    }
    onPartial?.(session.finalText || interim);
  };
  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      return;
    }
    if (event.error === 'not-allowed') {
      keepListening = false;
    }
  };
  recognition.onend = () => {
    if (session?.recognition && restartWebRecognition(session.recognition)) {
      return;
    }
    session?.resolveStop?.(session.finalText || session.chunks.join(' ').trim() || '');
  };
  recognition.start();
};

export const stopListening = async (): Promise<SpeechResult> => {
  const current = session;
  keepListening = false;
  if (!current) {
    return { text: '', provider: 'none' };
  }
  const text = await new Promise<string>((resolve) => {
    current.resolveStop = resolve;
    current.recognition?.stop();
    try {
      getNativeSpeech()?.stop();
    } catch {
      // Already stopped.
    }
    setTimeout(() => resolve(current.finalText || current.chunks.join(' ').trim() || ''), 1400);
  });
  current.subscriptions?.forEach((sub) => sub.remove());
  session = null;
  onPartial = null;
  return { text: text.trim(), provider: current.provider };
};

export const cancelListening = async (): Promise<void> => {
  keepListening = false;
  session?.subscriptions?.forEach((sub) => sub.remove());
  session?.recognition?.abort();
  try {
    getNativeSpeech()?.abort();
  } catch {
    // Not running.
  }
  session = null;
  onPartial = null;
};

export const appleSpeechProvider: SpeechToTextProvider = {
  start: () => startListening(),
  stop: stopListening,
  cancel: cancelListening,
};
