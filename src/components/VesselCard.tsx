import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Color, Type } from '../theme/tokens';
import { VesselContext } from '../types/vessel';
import { GlassSurface } from './GlassSurface';
import { VesselMark } from './icons/VesselMark';

export const VesselCard: React.FC<{ vessel: VesselContext }> = ({ vessel }) => {
  return (
    <GlassSurface>
      <View style={styles.inner} accessibilityRole="summary" accessibilityLabel={`${vessel.vesselName}, ${vessel.vesselType}`}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>VESSEL</Text>
          <Text style={styles.name}>{vessel.vesselName.toUpperCase()}</Text>
          <Text style={styles.type}>{vessel.vesselType}</Text>
        </View>
        <LinearGradient colors={['rgba(40, 56, 70, 0.7)', 'rgba(10, 14, 20, 0.9)']} style={styles.photo}>
          <VesselMark size={54} framed={false} />
        </LinearGradient>
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
  copy: {
    flex: 1,
  },
  kicker: {
    color: Color.textMuted,
    fontFamily: Type.displayMedium,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  name: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 26,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  type: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 13,
    marginTop: 2,
  },
  photo: {
    width: 86,
    height: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Color.hairline,
  },
});
