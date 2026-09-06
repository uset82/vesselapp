import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Color, Type } from '../theme/tokens';
import { GlassSurface } from './GlassSurface';
import { CapIcon } from './icons/BridgeIcons';
import { VesselMark } from './icons/VesselMark';

interface HeaderProps {
  onTrainingPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onTrainingPress }) => {
  return (
    <View style={styles.row}>
      <VesselMark size={42} />
      <View style={styles.copy}>
        <Text style={styles.title} accessibilityRole="header">
          SOGN SAFE VESSEL
        </Text>
        <Text style={styles.sub}>Captain Communication System</Text>
      </View>
      <Pressable
        onPress={onTrainingPress}
        onLongPress={onTrainingPress}
        accessibilityRole="button"
        accessibilityLabel="Training mode. Open demo controls."
      >
        <GlassSurface radius={12} style={styles.badge} tone="strong">
          <View style={styles.badgeInner}>
            <CapIcon />
            <Text style={styles.badgeText}>TRAINING MODE</Text>
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 20,
    letterSpacing: 0.8,
  },
  sub: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    minHeight: 44,
    minWidth: 72,
  },
  badgeInner: {
    minHeight: 44,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  badgeText: {
    color: Color.brass,
    fontFamily: Type.displayMedium,
    fontSize: 8,
    letterSpacing: 0.6,
  },
});
