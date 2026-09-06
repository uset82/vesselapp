import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const pulseLight = (): void => {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const pulseWarn = (): void => {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const pulseSuccess = (): void => {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
