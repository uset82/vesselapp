import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Color, Touch, Type } from '../theme/tokens';
import { PendingInterpretation } from '../types/agent';
import { VesselContext } from '../types/vessel';
import { GlassSurface } from './GlassSurface';

interface ConfirmationModalProps {
  visible: boolean;
  pending: PendingInterpretation | null;
  vessel: VesselContext;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  pending,
  vessel,
  submitting,
  onConfirm,
  onCancel,
}) => {
  const eventType = pending?.response.proposedEvent?.incidentType || 'UNKNOWN';
  const isEmergency = pending?.response.proposedEvent?.type === 'VESSEL_EMERGENCY_TRIGGERED';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.back}>
        <GlassSurface tone="strong" style={styles.sheet}>
        <View accessibilityViewIsModal style={styles.sheetInner}>
          <Text style={styles.kicker}>{isEmergency ? 'POSSIBLE EMERGENCY' : 'CONFIRM UPDATE'}</Text>
          <Text style={styles.lead}>I understood:</Text>
          <Text style={styles.event}>{eventType.replace(/_/g, ' ')}</Text>
          <Text style={styles.message}>{pending?.response.message}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>Position  Shared</Text>
            <Text style={styles.metaText}>Speed  {vessel.speedKnots.toFixed(1)} kn</Text>
            <Text style={styles.metaText}>Heading  {vessel.headingDegrees}°</Text>
          </View>
          <Text style={styles.ask}>
            {isEmergency ? 'Report this emergency to SOGN SAFE Platform?' : 'Send this update to SOGN SAFE Platform?'}
          </Text>
          <Text style={styles.training}>TRAINING MODE · FICTIONAL VESSEL · NO REAL EMERGENCY SERVICES CONNECTED</Text>
          <Pressable
            onPress={onConfirm}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={isEmergency ? 'Report emergency' : 'Send update'}
            style={[styles.primary, !isEmergency && styles.primaryUpdate, submitting && styles.disabled]}
          >
            <Text style={[styles.primaryText, !isEmergency && styles.primaryUpdateText]}>
              {submitting ? 'SENDING…' : isEmergency ? 'REPORT EMERGENCY' : 'SEND UPDATE'}
            </Text>
          </Pressable>
          <Pressable onPress={onCancel} disabled={submitting} accessibilityRole="button" accessibilityLabel="Cancel" style={styles.secondary}>
            <Text style={styles.secondaryText}>CANCEL</Text>
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
    color: Color.amber,
    fontFamily: Type.display,
    fontSize: 16,
    letterSpacing: 1.4,
  },
  lead: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    marginTop: 14,
  },
  event: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 34,
    lineHeight: 36,
    marginTop: 4,
  },
  message: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    marginTop: 10,
    fontSize: 15,
  },
  meta: {
    marginTop: 16,
    gap: 4,
  },
  metaText: {
    color: Color.silver,
    fontFamily: Type.bodyMedium,
  },
  ask: {
    color: Color.text,
    fontFamily: Type.bodyMedium,
    fontSize: 16,
    marginTop: 18,
  },
  training: {
    color: Color.brass,
    fontFamily: Type.body,
    fontSize: 10,
    marginTop: 10,
    letterSpacing: 0.4,
  },
  primary: {
    marginTop: 20,
    minHeight: Touch.confirm,
    borderRadius: 16,
    backgroundColor: Color.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 18,
    letterSpacing: 1,
  },
  secondary: {
    minHeight: Touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryText: {
    color: Color.silver,
    fontFamily: Type.displayMedium,
    letterSpacing: 1,
  },
  primaryUpdate: {
    backgroundColor: Color.silver,
  },
  primaryUpdateText: {
    color: Color.canvas,
  },
  disabled: {
    opacity: 0.55,
  },
});
