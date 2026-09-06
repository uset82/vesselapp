import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  useFonts as useDisplayFonts,
} from '@expo-google-fonts/barlow-condensed';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  useFonts as useBodyFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import { VesselProvider } from '../state/VesselProvider';
import { Color } from '../theme/tokens';

export default function RootLayout() {
  const [displayLoaded] = useDisplayFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });
  const [bodyLoaded] = useBodyFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });

  if (!displayLoaded || !bodyLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Color.silver} />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={styles.root}>
      <VesselProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Color.canvas },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="more" />
        </Stack>
      </VesselProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.canvas,
  },
  boot: {
    flex: 1,
    backgroundColor: Color.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
