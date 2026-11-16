import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LANG: '@mistri_language',
  HAS_CHOSEN_LANG: '@mistri_has_chosen_lang',
  USER_SESSION: '@mistri_session',
  ROLE: '@mistri_user_role',
  IS_DEV: '@mistri_is_dev',
  ONBOARDING_COMPLETED: '@mistri_onboarded',
  WORKER_PROFILE: '@mistri_worker_profile',
  NOTIFICATIONS: '@mistri_notifications',
  CREDENTIALS: '@mistri_credentials',
  BOOKINGS: '@mistri_bookings',
  ACCOUNT_REGISTRY: '@mistri_accounts_registry',
};

export const StorageService = {
  // Stored Credentials
  getCredentials: async () => {
    try {
      const data = await AsyncStorage.getItem(KEYS.CREDENTIALS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setCredentials: async (creds) => {
    try {
      await AsyncStorage.setItem(KEYS.CREDENTIALS, JSON.stringify(creds));
    } catch (e) {}
  },
  // 1. Language Preferences (Ask once, remember forever)
  getLanguage: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.LANG);
    } catch (e) {
      return null;
    }
  },
  getHasChosenLanguage: async () => {
    try {
      const val = await AsyncStorage.getItem(KEYS.HAS_CHOSEN_LANG);
      return val === 'true';
    } catch (e) {
      return false;
    }
  },
  setHasChosenLanguage: async (chosen = true) => {
    try {
      await AsyncStorage.setItem(KEYS.HAS_CHOSEN_LANG, chosen ? 'true' : 'false');
    } catch (e) {}
  },
  setLanguage: async (langCode) => {
    try {
      await AsyncStorage.setItem(KEYS.LANG, langCode);
      await AsyncStorage.setItem(KEYS.HAS_CHOSEN_LANG, 'true');
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
      // Clear current active session tokens but preserve permanent account registry & preferences
      await AsyncStorage.multiRemove([
        KEYS.USER_SESSION,
        KEYS.IS_DEV,
        KEYS.ONBOARDING_COMPLETED,
      ]);
    } catch (e) {}
  },

  // 2b. Permanent Account Registry (Remembers persona & profile per email / phone permanently)
  saveAccountProfile: async (identifier, { role, name, phone, email, kyc_status, address } = {}) => {
    try {
      if (!identifier) return;
      const key = String(identifier).trim().toLowerCase();
      const raw = await AsyncStorage.getItem(KEYS.ACCOUNT_REGISTRY);
      const registry = raw ? JSON.parse(raw) : {};
      const existing = registry[key] || {};
      registry[key] = {
        ...existing,
        identifier: key,
        role: role || existing.role || 'CUSTOMER',
        name: name || existing.name || '',
        phone: phone || existing.phone || '',
        email: email || (key.includes('@') ? key : existing.email || ''),
        kyc_status: kyc_status || existing.kyc_status || 'VERIFIED',
        address: address || existing.address || '',
        updatedAt: Date.now(),
      };
      await AsyncStorage.setItem(KEYS.ACCOUNT_REGISTRY, JSON.stringify(registry));
    } catch (e) {
      console.log('saveAccountProfile error:', e);
    }
  },
  getAccountProfile: async (identifier) => {
    try {
      if (!identifier) return null;
      const key = String(identifier).trim().toLowerCase();
      const raw = await AsyncStorage.getItem(KEYS.ACCOUNT_REGISTRY);
      if (!raw) return null;
      const registry = JSON.parse(raw);
      return registry[key] || null;
    } catch (e) {
      return null;
    }
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
