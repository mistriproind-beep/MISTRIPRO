import { supabase } from './supabase';
import { StorageService } from './storage';
import { signInWithEmail as apiSignInEmail, sendMobileOtp as apiSendOtp, verifyMobileOtp as apiVerifyOtp, signInWithGoogle as apiSignInGoogle } from './auth';

/**
 * MistriPro Centralized Authentication & Session Management Service
 * Production-ready handler for Language, Session Persistence, Profiles & Role State
 */
export const AuthService = {
  /**
   * 1. Initialize & check startup state (Language -> Session -> Profile -> Role)
   */
  checkInitialAuthState: async () => {
    try {
      // Step A: Check if language has been selected by user previously
      const hasChosenLang = await StorageService.getHasChosenLanguage();
      const savedLang = await StorageService.getLanguage();

      if (!hasChosenLang || !savedLang) {
        return { state: 'LANGUAGE_REQUIRED', lang: null };
      }

      // Step B: Check Supabase Auth persistent session
      let activeUser = null;
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (!sessionErr && sessionData?.session?.user) {
          activeUser = sessionData.session.user;
        }
      } catch (authErr) {
        console.log('Supabase getSession notice:', authErr?.message);
      }

      // Step C: If Supabase has an active authenticated user
      if (activeUser) {
        const userId = activeUser.id;
        const userEmail = (activeUser.email || '').trim().toLowerCase();
        const userPhone = (activeUser.phone || '').replace(/[^0-9]/g, '').slice(-10);

        // Fetch profile linked directly to this authenticated user ID
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('*, worker_profiles(*)')
          .eq('id', userId)
          .maybeSingle();

        if (profile && profile.role && String(profile.role).trim().length > 0) {
          const rawRole = String(profile.role).trim().toUpperCase();
          const cleanRole = rawRole.includes('WORKER') ? 'WORKER' : 'CUSTOMER';

          // Ensure local session is synchronized
          await StorageService.setRole(cleanRole);
          await StorageService.setSession({
            id: profile.id,
            role: cleanRole,
            name: profile.full_name || '',
            phone: profile.phone || userPhone,
            mobile: profile.phone || userPhone,
            email: profile.email || userEmail,
            address: profile.address || '',
            kyc_status: profile.kyc_status || 'VERIFIED',
          });

          return {
            state: 'AUTHENTICATED',
            role: cleanRole,
            user: activeUser,
            profile,
            workerProfile: profile.worker_profiles?.[0] || null,
          };
        }

        // If profile was not found by ID, try matching existing account by email or phone
        if (!profile && (userEmail || userPhone)) {
          const { data: matched } = await supabase
            .from('profiles')
            .select('*, worker_profiles(*)')
            .or(`email.ilike.${userEmail},alt_phone.ilike.${userEmail},phone.ilike.%${userPhone}%`)
            .limit(1)
            .maybeSingle();

          if (matched && matched.role && String(matched.role).trim().length > 0) {
            const cleanRole = String(matched.role).toUpperCase().includes('WORKER') ? 'WORKER' : 'CUSTOMER';
            // Migrate / associate profile to authenticated user ID
            await supabase.from('profiles').update({ id: userId, email: userEmail || matched.email }).eq('id', matched.id);

            await StorageService.setRole(cleanRole);
            await StorageService.setSession({
              id: userId,
              role: cleanRole,
              name: matched.full_name || '',
              phone: matched.phone || userPhone,
              mobile: matched.phone || userPhone,
              email: userEmail || matched.email,
              address: matched.address || '',
              kyc_status: matched.kyc_status || 'VERIFIED',
            });

            return {
              state: 'AUTHENTICATED',
              role: cleanRole,
              user: activeUser,
              profile: { ...matched, id: userId },
              workerProfile: matched.worker_profiles?.[0] || null,
            };
          }
        }

        // Profile exists but role is NULL or profile missing -> Need to select role
        return {
          state: 'ROLE_REQUIRED',
          user: activeUser,
          profile: profile || null,
        };
      }

      // Step D: Fallback to local persistent session if offline or Supabase session recovering
      const savedSession = await StorageService.getSession();
      const savedRole = await StorageService.getRole();

      if (savedSession && (savedSession.role || savedRole) && (savedSession.name || savedSession.phone || savedSession.email || savedSession.mobile)) {
        const cleanRole = (savedSession.role || savedRole || 'CUSTOMER').toUpperCase();
        return {
          state: 'AUTHENTICATED',
          role: cleanRole,
          user: null,
          profile: savedSession,
          workerProfile: null,
        };
      }

      // Step E: No active session -> show sign in
      return { state: 'UNAUTHENTICATED' };
    } catch (e) {
      console.log('checkInitialAuthState error:', e);
      return { state: 'UNAUTHENTICATED' };
    }
  },

  /**
   * 2. Save Language selection (only once on first launch)
   */
  selectLanguage: async (langCode) => {
    try {
      await StorageService.setLanguage(langCode);
      await StorageService.setHasChosenLanguage(true);

      // Also persist to Supabase profile if user is currently signed in
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await supabase.from('profiles').update({ preferred_language: langCode }).eq('id', session.user.id);
        }
      } catch (_) {}

      return true;
    } catch (e) {
      console.log('selectLanguage error:', e);
      return false;
    }
  },

  /**
   * 3. Set Role for New or Existing User (CUSTOMER or WORKER)
   */
  setRole: async (userId, role, { fullName, phone, email, address } = {}) => {
    try {
      const cleanRole = role.toUpperCase();
      await StorageService.setRole(cleanRole);

      const targetId = email || phone || userId;
      if (targetId) {
        await StorageService.saveAccountProfile(targetId, {
          role: cleanRole,
          name: fullName || '',
          phone: phone || '',
          email: email || '',
          address: address || '',
        });
      }

      // Update / Upsert profile in Supabase
      if (userId) {
        try {
          const profilePayload = {
            id: userId,
            role: cleanRole,
            full_name: fullName || (cleanRole === 'CUSTOMER' ? 'Customer' : 'Worker'),
            phone: phone || null,
            email: email || null,
            alt_phone: email || null,
            address: address || '',
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          };

          const { error: upsertErr } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
          if (upsertErr) {
            console.log('Supabase profile role upsert notice:', upsertErr.message);
          }

          // If Worker, ensure worker_profiles entry exists
          if (cleanRole === 'WORKER') {
            await supabase.from('worker_profiles').upsert({
              user_id: userId,
              is_available: true,
            }, { onConflict: 'user_id' }).catch(() => {});
          }
        } catch (dbErr) {
          console.log('Role DB sync error:', dbErr?.message);
        }
      }

      return { success: true, role: cleanRole };
    } catch (e) {
      console.log('AuthService.setRole error:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * 4. Sign Out & Clear Active Session
   */
  signOut: async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
      await StorageService.clearSession();
      return true;
    } catch (e) {
      console.log('AuthService.signOut error:', e);
      return false;
    }
  },
};
