import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Color } from '../theme/tokens';

export const GlassAtmosphere: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A1016', '#07090D', '#0B1820']} style={StyleSheet.absoluteFill} />
      <View style={styles.pool} />
      <View style={styles.horizon} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.canvas,
  },
  pool: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(63, 174, 108, 0.08)',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: 'rgba(14, 26, 36, 0.55)',
  },
});
