import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

export const DeviceFeedback = {
  // Vibration & Haptic on New Job Alert (Worker phone rings/vibrates)
  triggerAlertHaptics: async () => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        // Pattern: vibrate 400ms, pause 200ms, vibrate 400ms
        Vibration.vibrate([0, 400, 200, 400]);
      }
    } catch (e) {}
  },

  // Vibration on Booking Approved / Success
  triggerSuccessHaptics: async () => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 200, 100, 200]);
      }
    } catch (e) {}
  },

  // Light selection tap
  triggerLightTap: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  },

  // Alias for compatibility
  triggerLightHaptics: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  },
};
