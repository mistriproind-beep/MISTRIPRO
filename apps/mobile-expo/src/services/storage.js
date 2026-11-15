import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LANG: '@mistri_language',
  USER_SESSION: '@mistri_session',
  ROLE: '@mistri_user_role',
  IS_DEV: '@mistri_is_dev',
  ONBOARDING_COMPLETED: '@mistri_onboarded',
  WORKER_PROFILE: '@mistri_worker_profile',
  NOTIFICATIONS: '@mistri_notifications',
  BOOKINGS: '@mistri_bookings',
};

export const StorageService = {
  // 1. Language Preferences (Ask once, remember forever)
  getLanguage: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.LANG);
    } catch (e) {
      return null;
    }
  },
  setLanguage: async (langCode) => {
    try {
      await AsyncStorage.setItem(KEYS.LANG, langCode);
    } catch (e) {}
  },

  // 2. Auth Session & Profile
  getSession: async () => {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setSession: async (sessionObj) => {
    try {
      await AsyncStorage.setItem(KEYS.USER_SESSION, JSON.stringify(sessionObj));
    } catch (e) {}
  },
  clearSession: async () => {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER_SESSION,
        KEYS.ROLE,
        KEYS.IS_DEV,
        KEYS.ONBOARDING_COMPLETED,
      ]);
    } catch (e) {}
  },

  // 3. User Role & Dev Status
  getRole: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.ROLE);
    } catch (e) {
      return null;
    }
  },
  setRole: async (role) => {
    try {
      await AsyncStorage.setItem(KEYS.ROLE, role);
    } catch (e) {}
  },

  getIsDev: async () => {
    try {
      const isDev = await AsyncStorage.getItem(KEYS.IS_DEV);
      return isDev === 'true';
    } catch (e) {
      return false;
    }
  },
  setIsDev: async (isDev) => {
    try {
      await AsyncStorage.setItem(KEYS.IS_DEV, isDev ? 'true' : 'false');
    } catch (e) {}
  },

  // 4. Onboarding status
  getOnboarded: async () => {
    try {
      const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
      return val === 'true';
    } catch (e) {
      return false;
    }
  },
  setOnboarded: async (onboarded) => {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, onboarded ? 'true' : 'false');
    } catch (e) {}
  },

  // 5. Notifications Storage
  getNotifications: async () => {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  setNotifications: async (notifications) => {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {}
  },

  // 6. Local Bookings Cache
  getBookings: async () => {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKINGS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setBookings: async (bookings) => {
    try {
      await AsyncStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {}
  },
};
