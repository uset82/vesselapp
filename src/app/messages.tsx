import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomNav } from '../components/BottomNav';
import { HistoryList } from '../components/HistoryList';
import { useVessel } from '../state/VesselProvider';
import { GlassAtmosphere } from '../components/GlassAtmosphere';
import { Color, Type } from '../theme/tokens';

export default function MessagesScreen() {
  const router = useRouter();
  const { history, conversation } = useVessel();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <GlassAtmosphere>
      <View style={styles.page}>
        <Text style={styles.title}>OPERATIONAL LOG</Text>
        <Text style={styles.sub}>Captain, Vessel Agent, and Platform acknowledgements.</Text>
        <HistoryList history={history} conversation={conversation} />
        <BottomNav
          active="messages"
          onHome={() => router.replace('/')}
          onMessages={() => undefined}
          onMore={() => router.push('/more')}
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 0,
    gap: 10,
  },
  title: {
    color: Color.text,
    fontFamily: Type.display,
    fontSize: 28,
    letterSpacing: 1,
  },
  sub: {
    color: Color.textSecondary,
    fontFamily: Type.body,
  },
});
