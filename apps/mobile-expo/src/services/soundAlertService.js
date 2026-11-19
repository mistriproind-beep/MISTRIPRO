import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * In-App Ringtone, Chime & Urgent Buzz Vibration Service
 * Plays distinct telephone rings / alert chimes and vibration buzzes
 * for incoming customer booking requests and high-priority notifications.
 */

// Global callback for headless audio trigger
let _playAudioCallback = null;

export const registerAudioPlayer = (cb) => {
  _playAudioCallback = cb;
};

export const SoundAlertService = {
  /**
   * 1. Incoming Booking Request Alert (Loud Ring + Urgent Buzz Pattern)
   */
  ringIncomingBookingRequest: () => {
    try {
      // Urgent telephone ringing vibration pattern: Ring (600ms) - Pause (200ms) - Ring (600ms) - Pause (400ms) - Ring (1000ms)
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 600, 200, 600, 400, 1000]);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
      }

      // Trigger synthesized audio ringtone via Web Audio
      if (_playAudioCallback) {
        _playAudioCallback('RING');
      }
    } catch (e) {
      console.log('ringIncomingBookingRequest error:', e);
    }
  },

  /**
   * 2. General Notification Alert (Short Chime + Double Buzz)
   */
  buzzNotification: () => {
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 250, 150, 350]);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (_) {}
      }

      if (_playAudioCallback) {
        _playAudioCallback('CHIME');
      }
    } catch (e) {
      console.log('buzzNotification error:', e);
    }
  },

  /**
   * 3. Stop ringing & vibrations immediately (e.g. when user accepts or dismisses)
   */
  stopAlert: () => {
    try {
      if (Platform.OS !== 'web') {
        Vibration.cancel();
      }
      if (_playAudioCallback) {
        _playAudioCallback('STOP');
      }
    } catch (e) {}
  },
};
