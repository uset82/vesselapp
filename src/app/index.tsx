import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomNav } from '../components/BottomNav';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DemoPanel } from '../components/DemoPanel';
import { Header } from '../components/Header';
import { MicButton } from '../components/MicButton';
import { ReportedModal } from '../components/ReportedModal';
import { StatusBanner } from '../components/StatusBanner';
import { TelemetryGrid } from '../components/TelemetryGrid';
import { TypeComposer } from '../components/TypeComposer';
import { VesselCard } from '../components/VesselCard';
import { GlassAtmosphere } from '../components/GlassAtmosphere';
import { useVessel } from '../state/VesselProvider';
import { Color, Type } from '../theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const store = useVessel();
  const clock = useMemo(
    () => new Date(store.vessel.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [store.vessel.updatedAt]
  );
  const latest = store.conversation.at(-1);

  return (
    <SafeAreaView style={styles.safe}>
      <GlassAtmosphere>
      <View style={styles.page}>
        <Header onTrainingPress={store.handleToggleDemo} />
        <VesselCard vessel={store.vessel} />
        <StatusBanner
          vessel={store.vessel}
          interaction={store.interaction}
          platformLabel={store.platformStatusLabel}
        />
        {store.agentUnavailable ? (
          <View style={styles.agentDown}>
            <Text style={styles.agentTitle}>AGENT TEMPORARILY UNAVAILABLE</Text>
            <Text style={styles.agentCopy}>You can still report the training emergency manually.</Text>
            <Pressable onPress={store.handleManualEmergency} style={styles.manual} accessibilityRole="button" accessibilityLabel="Report maneuverability lost">
              <Text style={styles.manualText}>REPORT MANEUVERABILITY LOST</Text>
            </Pressable>
          </View>
        ) : null}
        {store.lastError ? <Text style={styles.error}>{store.lastError}</Text> : null}
        {latest ? (
          <Text style={styles.latest} numberOfLines={2}>
            {latest.role === 'captain' ? 'Captain: ' : 'SOGN: '}
            {latest.text}
          </Text>
        ) : null}
        <View style={styles.micArea}>
          <MicButton
            state={store.interaction}
            partial={store.partialTranscript}
            onPress={store.handleMicPress}
            onCancel={store.handleCancelListen}
          />
          <TypeComposer
            open={store.typedOpen}
            busy={store.interaction === 'UNDERSTANDING' || store.submitting}
            onToggle={store.handleToggleType}
            onSend={store.handleSendText}
          />
        </View>
        <TelemetryGrid vessel={store.vessel} clock={clock} />
        <Text style={styles.disclaimer}>Training Mode · Fictional Vessel</Text>
        <Text style={styles.disclaimer}>No real emergency services connected</Text>
        <BottomNav
          active="home"
          onHome={() => undefined}
          onMessages={() => router.push('/messages')}
          onMore={() => router.push('/more')}
        />
      </View>
      </GlassAtmosphere>
      <ConfirmationModal
        visible={store.interaction === 'CONFIRMATION_REQUIRED'}
        pending={store.pending}
        vessel={store.vessel}
        submitting={store.submitting}
        onConfirm={store.handleConfirm}
        onCancel={store.handleCancelConfirm}
      />
      <ReportedModal
        visible={
          store.interaction === 'REPORTED' &&
          store.lastReportIsEmergency &&
          Boolean(store.acknowledgement?.acknowledged)
        }
        ack={store.acknowledgement}
        onContinue={store.handleContinueTalking}
      />
      <DemoPanel
        visible={store.showDemo}
        onClose={store.handleToggleDemo}
        onLost={store.handleDemoLost}
        onRestore={store.handleDemoRestore}
        onReset={store.handleReset}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Color.canvas,
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 12,
  },
  micArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  latest: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 13,
    textAlign: 'center',
  },
  error: {
    color: Color.amber,
    fontFamily: Type.bodyMedium,
    textAlign: 'center',
  },
  agentDown: {
    borderWidth: 1,
    borderColor: Color.amber,
    backgroundColor: Color.amberSoft,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  agentTitle: {
    color: Color.amber,
    fontFamily: Type.displayMedium,
    letterSpacing: 0.8,
  },
  agentCopy: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    fontSize: 13,
  },
  manual: {
    minHeight: 44,
    justifyContent: 'center',
  },
  manualText: {
    color: Color.text,
    fontFamily: Type.displayMedium,
  },
  disclaimer: {
    color: Color.textMuted,
    fontFamily: Type.body,
    fontSize: 11,
    textAlign: 'center',
  },
});
