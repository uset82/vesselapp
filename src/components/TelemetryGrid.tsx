import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Color, Type } from '../theme/tokens';
import { VesselContext } from '../types/vessel';
import { GlassSurface } from './GlassSurface';
import { ClockIcon, CloudIcon, CompassIcon, PinIcon, SpeedIcon } from './icons/BridgeIcons';

const Tile: React.FC<{ label: string; value: string; icon: React.ReactNode; ok?: boolean }> = ({
  label,
  value,
  icon,
  ok,
}) => (
  <GlassSurface radius={16} style={styles.tile}>
    <View style={styles.tileInner} accessibilityLabel={`${label} ${value}`}>
      {icon}
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        {ok != null ? <View style={[styles.dot, { backgroundColor: ok ? Color.green : Color.amber }]} /> : null}
        <Text style={[styles.value, ok === false && { color: Color.amber }]}>{value}</Text>
      </View>
    </View>
  </GlassSurface>
);

export const TelemetryGrid: React.FC<{ vessel: VesselContext; clock: string }> = ({ vessel, clock }) => {
  const connected = vessel.platformConnection === 'CONNECTED';
  return (
    <View style={styles.grid}>
      <Tile label="POSITION" value="Shared" ok icon={<PinIcon />} />
      <Tile
        label="PLATFORM"
        value={connected ? 'Connected' : 'Lost'}
        ok={connected}
        icon={<CloudIcon color={connected ? Color.green : Color.amber} />}
      />
      <Tile label="SPEED" value={`${vessel.speedKnots.toFixed(1)} kn`} icon={<SpeedIcon />} />
      <Tile label="HEADING" value={`${vessel.headingDegrees}°`} icon={<CompassIcon />} />
      <Tile label="LAST UPDATE" value={clock} icon={<ClockIcon />} />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    flex: 1,
    minHeight: 76,
  },
  tileInner: {
    minHeight: 76,
    padding: 8,
    justifyContent: 'space-between',
  },
  label: {
    color: Color.textMuted,
    fontFamily: Type.displayMedium,
    fontSize: 8,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    color: Color.text,
    fontFamily: Type.bodyMedium,
    fontSize: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
