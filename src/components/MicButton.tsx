import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Color, Touch, Type } from '../theme/tokens';
import { CaptainInteractionState } from '../types/vessel';
import { MicrophoneIcon } from './icons/BridgeIcons';

interface MicButtonProps {
  state: CaptainInteractionState;
  partial: string;
  onPress: () => void;
  onCancel: () => void;
}

const labelFor = (state: CaptainInteractionState, partial: string): string => {
  if (state === 'LISTENING') {
    return partial || 'LISTENING';
  }
  if (state === 'TRANSCRIBING') {
    return 'TRANSCRIBING';
  }
  if (state === 'UNDERSTANDING') {
    return 'UNDERSTANDING';
  }
  if (state === 'REPORTING') {
    return 'REPORTING';
  }
  if (state === 'CONFIRMATION_REQUIRED') {
    return 'CONFIRMATION REQUIRED';
  }
  return 'TALK TO SOGN';
};

export const MicButton: React.FC<MicButtonProps> = ({ state, partial, onPress, onCancel }) => {
  const listening = state === 'LISTENING';
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = listening ? withRepeat(withTiming(1.06, { duration: 900 }), -1, true) : withTiming(1, { duration: 180 });
  }, [listening, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.halo, ringStyle, listening && styles.haloLive]} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={listening ? 'Stop listening' : 'Talk to SOGN'}
        style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
      >
        <LinearGradient colors={['#E8EEF4', '#8B949E', '#C5CDD6']} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.bezel}>
          <View style={[styles.inner, listening && styles.innerLive]}>
            <View style={styles.core}>
              <MicrophoneIcon size={34} color={Color.text} />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
      <Text style={styles.talk}>{labelFor(state, partial)}</Text>
      <Text style={styles.hint}>{listening ? 'Tap again to send' : 'Tell me what is happening.'}</Text>
      {listening ? (
        <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel listening" style={styles.cancel}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    width: Touch.mic + 18,
    height: Touch.mic + 18,
    borderRadius: 999,
    backgroundColor: 'rgba(63, 174, 108, 0.08)',
  },
  haloLive: {
    backgroundColor: 'rgba(63, 174, 108, 0.2)',
  },
  hit: {
    width: Touch.mic,
    height: Touch.mic,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.88,
  },
  bezel: {
    flex: 1,
    borderRadius: 999,
    padding: 7,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  inner: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: Color.green,
    backgroundColor: Color.inset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerLive: {
    borderColor: Color.amber,
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0A1014',
    alignItems: 'center',
    justifyContent: 'center',
  },
  talk: {
    marginTop: 16,
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 28,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  hint: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 14,
    marginTop: 4,
  },
  cancel: {
    marginTop: 10,
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cancelText: {
    color: Color.amber,
    fontFamily: Type.displayMedium,
    letterSpacing: 1,
  },
});
