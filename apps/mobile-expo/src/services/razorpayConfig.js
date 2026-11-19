import { supabase } from './supabase';

export const GATEWAY_CONFIG_PROFILE_ID = '00000000-0000-0000-0000-000000000099';

export const DEFAULT_RAZORPAY_CONFIG = {
  KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_U1wTVQHlvrLyos',
  KEY_SECRET: process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET || 'MRnGqIxKR4JTNxH2M7EHeqWc',
  MERCHANT_NAME: 'Mistri Pro Secured Payments',
  CURRENCY: 'INR',
  THEME_COLOR: '#4F46E5',
  MODE: 'test',
  ENABLED: true,
  COMPANY_PHONE: '+91 98290 12345',
  BOOKING_FEE: 99,
  MILESTONE_TARGET: 10,
  MILESTONE_BONUS: 200,
};

let cachedLiveConfig = { ...DEFAULT_RAZORPAY_CONFIG };

/**
 * Fetches the active Razorpay credentials & platform controls directly from Supabase Cloud.
 * Enables live modification from the Super Admin Panel.
 */
export async function getLiveRazorpayConfig() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('address, phone, city, state')
      .eq('id', GATEWAY_CONFIG_PROFILE_ID)
      .maybeSingle();

    if (data?.address) {
      try {
        const parsed = JSON.parse(data.address);
        cachedLiveConfig = {
          KEY_ID: parsed.key_id || cachedLiveConfig.KEY_ID,
          KEY_SECRET: parsed.key_secret || cachedLiveConfig.KEY_SECRET,
          MERCHANT_NAME: parsed.merchant_name || 'Mistri Pro Secured Payments',
          CURRENCY: 'INR',
          THEME_COLOR: '#4F46E5',
          MODE: parsed.mode || 'live',
          ENABLED: parsed.enabled !== false,
          COMPANY_PHONE: parsed.company_phone || data.phone || cachedLiveConfig.COMPANY_PHONE,
          BOOKING_FEE: Number(parsed.booking_fee) || 99,
          MILESTONE_TARGET: Number(parsed.milestone_target) || 10,
          MILESTONE_BONUS: Number(parsed.milestone_bonus) || 200,
        };
        return cachedLiveConfig;
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
 * Saves updated Razorpay credentials & platform controls to Supabase Cloud from admin or app.
 */
export async function saveLiveRazorpayConfig(config) {
  try {
    const payload = {
      key_id: config.KEY_ID || config.key_id || cachedLiveConfig.KEY_ID,
      key_secret: config.KEY_SECRET || config.key_secret || cachedLiveConfig.KEY_SECRET,
      mode: config.MODE || config.mode || 'live',
      merchant_name: config.MERCHANT_NAME || config.merchant_name || 'Mistri Pro Secured Payments',
      webhook_secret: config.webhook_secret || '',
      enabled: config.enabled !== false,
      company_phone: config.COMPANY_PHONE || config.company_phone || cachedLiveConfig.COMPANY_PHONE,
      booking_fee: Number(config.BOOKING_FEE || config.booking_fee) || 99,
      milestone_target: Number(config.MILESTONE_TARGET || config.milestone_target) || 10,
      milestone_bonus: Number(config.MILESTONE_BONUS || config.milestone_bonus) || 200,
    };

    const { error } = await supabase.from('profiles').upsert([
      {
        id: GATEWAY_CONFIG_PROFILE_ID,
        role: 'ADMIN_GATEWAY',
        full_name: 'Razorpay Gateway & Helpline Settings',
        phone: payload.company_phone,
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
        COMPANY_PHONE: payload.company_phone,
        BOOKING_FEE: payload.booking_fee,
        MILESTONE_TARGET: payload.milestone_target,
        MILESTONE_BONUS: payload.milestone_bonus,
      };
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const RAZORPAY_CONFIG = cachedLiveConfig;
