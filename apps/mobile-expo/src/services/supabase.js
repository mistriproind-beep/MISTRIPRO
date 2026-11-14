import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://jmdijseowvqvldlhhwsp.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_I-_tRn1OpP7mijyP1kjtlA_DtyTGJej';

// In Expo Go, @react-native-async-storage requires pre-compiled binaries
// Using custom lightweight in-memory storage adapter for Expo Go avoids native module null errors
const memoryStore = new Map();
const expoStorageAdapter = {
  getItem: async (key) => memoryStore.get(key) || null,
  setItem: async (key, value) => { memoryStore.set(key, value); },
  removeItem: async (key) => { memoryStore.delete(key); },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: expoStorageAdapter,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
