import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Color, Glass, Radius } from '../theme/tokens';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  radius?: number;
  tone?: 'default' | 'strong' | 'signal';
  signal?: string;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = Glass.blur,
  radius = Radius.card,
  tone = 'default',
  signal,
}) => {
  const fill =
    tone === 'strong' ? Color.glassStrong : tone === 'signal' ? 'rgba(16, 28, 24, 0.42)' : Color.glass;

  return (
    <View style={[styles.wrap, { borderRadius: radius, borderColor: signal || Color.hairline }, style]}>
      {Platform.OS === 'web' ? (
        <View style={[styles.webGlass, { backgroundColor: fill, borderRadius: radius }]} />
      ) : (
        <BlurView intensity={intensity} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
      )}
      <View pointerEvents="none" style={[styles.specular, { borderRadius: radius }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: Color.glass,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  webGlass: {
    ...StyleSheet.absoluteFillObject,
    // @ts-expect-error web-only material
    backdropFilter: 'blur(22px) saturate(1.45)',
    WebkitBackdropFilter: 'blur(22px) saturate(1.45)',
  },
  specular: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: Color.specular,
    opacity: 0.22,
  },
  content: {
    position: 'relative',
  },
});
