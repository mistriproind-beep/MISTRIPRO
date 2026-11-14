import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/**
 * 1. Live Google OAuth via Supabase
 */
export async function signInWithGoogle() {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'mistripro',
      preferLocalhost: true,
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No authorization URL returned from Supabase');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success' && result.url) {
      // Parse parameters from redirect URL
      const parsedUrl = new URL(result.url);
      const hashParams = new URLSearchParams(parsedUrl.hash.replace('#', ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        return { success: true, session: sessionData.session };
      }
      return { success: true };
    }

    return { success: false, cancelled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Mobile Phone OTP via Supabase
 */
export async function sendMobileOtp(phoneNumber) {
  try {
    // Standardize phone format (+91...)
    let cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: cleaned,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Verify Mobile Phone OTP via Supabase
 */
export async function verifyMobileOtp(phoneNumber, token) {
  try {
    let cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: cleaned,
      token: token.trim(),
      type: 'sms',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
