import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomNav } from '../components/BottomNav';
import { useVessel } from '../state/VesselProvider';
import { GlassAtmosphere } from '../components/GlassAtmosphere';
import { GlassSurface } from '../components/GlassSurface';
import { Color, Touch, Type } from '../theme/tokens';

export default function MoreScreen() {
  const router = useRouter();
  const store = useVessel();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <GlassAtmosphere>
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>MORE</Text>
          <Text style={styles.copy}>
            SOGN SAFE Vessel reports confirmed events to the Platform. It does not alert civilians and does not control the ship.
          </Text>
          <Text style={styles.training}>TRAINING MODE · FICTIONAL VESSEL · NO REAL EMERGENCY SERVICES CONNECTED</Text>
          <Pressable onPress={store.handleToggleDemo} accessibilityRole="button" accessibilityLabel="Open demo controls">
            <GlassSurface style={styles.btn}><Text style={styles.btnText}>DEMO CONTROLS</Text></GlassSurface>
          </Pressable>
          <Pressable onPress={store.handleManualEmergency} accessibilityRole="button" accessibilityLabel="Report maneuverability lost">
            <GlassSurface style={styles.btn}><Text style={styles.btnText}>REPORT MANEUVERABILITY LOST</Text></GlassSurface>
          </Pressable>
          <Pressable onPress={store.handleToggleTts} accessibilityRole="button" accessibilityLabel="Toggle agent speech">
            <GlassSurface style={styles.btn}><Text style={styles.btnText}>{store.ttsEnabled ? 'AGENT SPEECH ON' : 'AGENT SPEECH OFF'}</Text></GlassSurface>
          </Pressable>
          <Pressable onPress={store.handleStopSpeaking} accessibilityRole="button" accessibilityLabel="Stop speaking">
            <GlassSurface style={styles.btn}><Text style={styles.btnText}>STOP SPEAKING</Text></GlassSurface>
          </Pressable>
          <Pressable onPress={store.handleRequestSpeech} accessibilityRole="button" accessibilityLabel="Request microphone permission">
            <GlassSurface style={styles.btn}><Text style={styles.btnText}>MICROPHONE PERMISSION: {store.speechPermission.toUpperCase()}</Text></GlassSurface>
          </Pressable>
          <Pressable onPress={store.handleReset} accessibilityRole="button" accessibilityLabel="Reset vessel">
            <GlassSurface style={styles.btn}><Text style={styles.btnText}>RESET SCENARIO</Text></GlassSurface>
          </Pressable>
        </ScrollView>
        <BottomNav
          active="more"
          onHome={() => router.replace('/')}
          onMessages={() => router.push('/messages')}
          onMore={() => undefined}
        />
      </View>
      </GlassAtmosphere>
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
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 10,
  },
  title: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 28,
    letterSpacing: 1,
  },
  copy: {
    color: Color.textSecondary,
    fontFamily: Type.body,
    lineHeight: 20,
  },
  training: {
    color: Color.brass,
    fontFamily: Type.body,
    fontSize: 12,
  },
  btn: {
    minHeight: Touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  btnText: {
    color: Color.silverBright,
    fontFamily: Type.displayMedium,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
