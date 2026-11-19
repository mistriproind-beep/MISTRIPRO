import { supabase } from './supabase';

export const GATEWAY_CONFIG_PROFILE_ID = '00000000-0000-0000-0000-000000000099';

export const DEFAULT_RAZORPAY_CONFIG = {
  KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Sx6IT09QMzFIAk',
  KEY_SECRET: process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET || 'MRnGqIxKR4JTNxH2M7EHeqWc',
  MERCHANT_NAME: 'Mistri Pro Secured Payments',
  CURRENCY: 'INR',
  THEME_COLOR: '#4F46E5',
  MODE: 'live',
  ENABLED: true,
};

let cachedLiveConfig = { ...DEFAULT_RAZORPAY_CONFIG };

/**
 * Fetches the active Razorpay credentials directly from Supabase Cloud.
 * Enables live modification from the Super Admin Panel.
 */
export async function getLiveRazorpayConfig() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('address, city, state')
      .eq('id', GATEWAY_CONFIG_PROFILE_ID)
      .maybeSingle();

    if (data?.address) {
      try {
        const parsed = JSON.parse(data.address);
        if (parsed.key_id) {
          cachedLiveConfig = {
            KEY_ID: parsed.key_id,
            KEY_SECRET: parsed.key_secret || cachedLiveConfig.KEY_SECRET,
            MERCHANT_NAME: parsed.merchant_name || 'Mistri Pro Secured Payments',
            CURRENCY: 'INR',
            THEME_COLOR: '#4F46E5',
            MODE: parsed.mode || 'live',
            ENABLED: parsed.enabled !== false,
          };
          return cachedLiveConfig;
        }
      } catch (jsonErr) {
        console.log('Error parsing razorpay config address:', jsonErr);
      }
    }
  } catch (err) {
    console.log('Error fetching live razorpay config from Supabase:', err);
  }
  return cachedLiveConfig;
}

/**
 * Saves updated Razorpay credentials to Supabase Cloud from admin or app.
 */
export async function saveLiveRazorpayConfig(config) {
  try {
    const payload = {
      key_id: config.KEY_ID || config.key_id,
      key_secret: config.KEY_SECRET || config.key_secret,
      mode: config.MODE || config.mode || 'live',
      merchant_name: config.MERCHANT_NAME || config.merchant_name || 'Mistri Pro Secured Payments',
      webhook_secret: config.webhook_secret || '',
      enabled: config.enabled !== false,
    };

    const { error } = await supabase.from('profiles').upsert([
      {
        id: GATEWAY_CONFIG_PROFILE_ID,
        role: 'ADMIN_GATEWAY',
        full_name: 'Razorpay Gateway Settings',
        phone: '0000000000',
        address: JSON.stringify(payload),
        city: payload.mode,
        state: payload.enabled ? 'ACTIVE' : 'DISABLED',
        kyc_status: 'VERIFIED',
        updated_at: new Date().toISOString(),
      },
    ]);

    if (!error) {
      cachedLiveConfig = {
        ...cachedLiveConfig,
        KEY_ID: payload.key_id,
        KEY_SECRET: payload.key_secret,
        MERCHANT_NAME: payload.merchant_name,
        MODE: payload.mode,
        ENABLED: payload.enabled,
      };
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const RAZORPAY_CONFIG = cachedLiveConfig;
