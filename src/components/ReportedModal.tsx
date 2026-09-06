import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Color, Touch, Type } from '../theme/tokens';
import { PlatformAcknowledgement } from '../types/vessel';
import { GlassSurface } from './GlassSurface';

export const ReportedModal: React.FC<{
  visible: boolean;
  ack: PlatformAcknowledgement | null;
  onContinue: () => void;
}> = ({ visible, ack, onContinue }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.back}>
        <GlassSurface tone="strong" signal={Color.red} style={styles.sheet}>
        <View style={styles.sheetInner}>
          <Text style={styles.kicker}>EMERGENCY REPORTED</Text>
          <Text style={styles.time}>{new Date().toLocaleTimeString()}</Text>
          <Text style={styles.lead}>SOGN SAFE Platform received:</Text>
          {['Maneuverability lost', 'Vessel position', 'Vessel identity', 'Current heading', 'Current speed'].map((item) => (
            <Text key={item} style={styles.item}>
              ✓  {item}
            </Text>
          ))}
          <Text style={styles.platform}>Platform coordination activated.</Text>
          {ack?.incidentId ? <Text style={styles.dev}>Incident {ack.incidentId}</Text> : null}
          {ack?.eventId ? <Text style={styles.dev}>Event {ack.eventId}</Text> : null}
          <Text style={styles.note}>Civilian alert is only confirmed when the Platform reports that state.</Text>
          <Text style={styles.training}>TRAINING MODE · FICTIONAL VESSEL</Text>
          <Pressable onPress={onContinue} accessibilityRole="button" accessibilityLabel="Continue talking" style={styles.btn}>
            <Text style={styles.btnText}>CONTINUE TALKING</Text>
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
  },
  kicker: {
    color: Color.red,
    fontFamily: Type.display,
    fontSize: 22,
    letterSpacing: 1,
  },
  time: {
    color: Color.textSecondary,
    marginTop: 4,
    fontFamily: Type.body,
  },
  lead: {
    color: Color.text,
    fontFamily: Type.bodyMedium,
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    color: Color.silver,
    fontFamily: Type.body,
    marginTop: 4,
  },
  platform: {
    color: Color.text,
    fontFamily: Type.bodyMedium,
    marginTop: 16,
  },
  dev: {
    color: Color.textMuted,
    fontFamily: Type.body,
    fontSize: 12,
    marginTop: 4,
  },
  note: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 12,
    marginTop: 12,
  },
  training: {
    color: Color.brass,
    marginTop: 10,
    fontFamily: Type.body,
    fontSize: 11,
  },
  btn: {
    marginTop: 20,
    minHeight: Touch.confirm,
    borderRadius: 16,
    backgroundColor: Color.silver,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Color.canvas,
    fontFamily: Type.display,
    fontSize: 18,
    letterSpacing: 1,
  },
});
