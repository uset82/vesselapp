import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Color, Type } from '../theme/tokens';
import { CaptainInteractionState, VesselContext } from '../types/vessel';
import { GlassSurface } from './GlassSurface';

const toneFor = (vessel: VesselContext, interaction: CaptainInteractionState) => {
  if (vessel.platformConnection === 'DISCONNECTED') {
    return { label: 'PLATFORM CONNECTION LOST', detail: 'Do not assume any report was delivered.', color: Color.amber };
  }
  if (vessel.maneuverabilityStatus === 'LOST' || interaction === 'REPORTED' || interaction === 'REPORTING') {
    return { label: 'EMERGENCY REPORTED', detail: 'Platform coordination is the source of truth.', color: Color.red };
  }
  if (vessel.maneuverabilityStatus === 'RESTORED' || vessel.maneuverabilityStatus === 'RECOVERING') {
    return { label: vessel.maneuverabilityStatus, detail: 'Recovery update is with the Platform.', color: Color.amber };
  }
  return { label: 'NORMAL', detail: 'Vessel reporting active', color: Color.green };
};

export const StatusBanner: React.FC<{
  vessel: VesselContext;
  interaction: CaptainInteractionState;
  platformLabel: string;
  compact?: boolean;
}> = ({
  vessel,
  interaction,
  platformLabel,
  compact,
}) => {
  const tone = toneFor(vessel, interaction);
  const glow = useSharedValue(0.7);

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [glow]);

  const ledStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.92 + glow.value * 0.08 }],
  }));

  return (
    <GlassSurface tone="signal" signal={tone.color}>
      <View style={[styles.inner, compact && styles.innerCompact]}>
        <Animated.View style={[styles.led, { backgroundColor: tone.color, shadowColor: tone.color }, ledStyle]} />
        <View style={styles.copy}>
          <Text style={[styles.label, compact && styles.labelCompact]}>{tone.label}</Text>
          <Text style={styles.detail}>{tone.detail}</Text>
          <Text style={styles.detail}>
            {vessel.platformConnection === 'CONNECTED'
              ? `Connected to SOGN SAFE Platform · ${platformLabel}`
              : 'Platform unreachable'}
          </Text>
        </View>
      </View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  inner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  innerCompact: {
    padding: 12,
    alignItems: 'flex-start',
  },
  led: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 24,
    letterSpacing: 1,
    flexShrink: 1,
  },
  labelCompact: {
    fontSize: 16,
    lineHeight: 18,
    letterSpacing: 0.6,
  },
  detail: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
    flexShrink: 1,
  },
});
