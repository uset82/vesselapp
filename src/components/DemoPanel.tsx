import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Color, Touch, Type } from '../theme/tokens';
import { GlassSurface } from './GlassSurface';

export const DemoPanel: React.FC<{
  visible: boolean;
  onClose: () => void;
  onLost: () => void;
  onFire: () => void;
  onFireContained: () => void;
  onRestore: () => void;
  onReset: () => void;
}> = ({ visible, onClose, onLost, onFire, onFireContained, onRestore, onReset }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.back}>
        <GlassSurface tone="strong" signal={Color.brass} style={styles.sheet}>
        <View style={styles.sheetInner}>
          <Text style={styles.kicker}>DEMO CONTROLS</Text>
          <Text style={styles.note}>Training simulation only. These buttons reuse the real event pipeline.</Text>
          <Pressable onPress={onFire} style={styles.danger} accessibilityRole="button" accessibilityLabel="Trigger fire onboard">
            <Text style={styles.dangerText}>TRIGGER FIRE ONBOARD</Text>
          </Pressable>
          <Pressable onPress={onFireContained} style={styles.btn} accessibilityRole="button" accessibilityLabel="Report fire under control">
            <Text style={styles.btnText}>REPORT FIRE UNDER CONTROL</Text>
          </Pressable>
          <Pressable onPress={onLost} style={styles.danger} accessibilityRole="button" accessibilityLabel="Trigger maneuverability lost">
            <Text style={styles.dangerText}>TRIGGER MANEUVERABILITY LOST</Text>
          </Pressable>
          <Pressable onPress={onRestore} style={styles.btn} accessibilityRole="button" accessibilityLabel="Restore maneuverability">
            <Text style={styles.btnText}>RESTORE MANEUVERABILITY</Text>
          </Pressable>
          <Pressable onPress={onReset} style={styles.btn} accessibilityRole="button" accessibilityLabel="Reset vessel">
            <Text style={styles.btnText}>RESET VESSEL</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close demo controls">
            <Text style={styles.closeText}>CLOSE</Text>
          </Pressable>
        </View>
        </GlassSurface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  back: {
    flex: 1,
    backgroundColor: 'rgba(3, 6, 10, 0.78)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    padding: 0,
  },
  sheetInner: {
    padding: 22,
    gap: 10,
  },
  kicker: {
    color: Color.brass,
    fontFamily: Type.display,
    fontSize: 20,
    letterSpacing: 1,
  },
  note: {
    color: Color.textSecondary,
    fontFamily: Type.body,
  },
  danger: {
    minHeight: Touch.confirm,
    borderRadius: 14,
    backgroundColor: Color.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    color: Color.text,
    fontFamily: Type.display,
    letterSpacing: 0.6,
  },
  btn: {
    minHeight: Touch.min,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Color.silver,
    fontFamily: Type.displayMedium,
  },
  close: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Color.textMuted,
    fontFamily: Type.displayMedium,
  },
});
