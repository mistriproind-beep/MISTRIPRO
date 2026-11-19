-- ==============================================================================
-- MISTRI PRO - SAFE DATABASE MIGRATION SCRIPT FOR LIVE SUPABASE
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/jmdijseowvqvldlhhwsp/sql
-- Safe to execute: Preserves all existing profiles, workers, bookings, and settings
-- ==============================================================================

-- 1. SAFELY ADD MISSING COLUMNS TO PROFILES TABLE
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pincode TEXT;

-- 2. MIGRATE EXISTING EMAILS STORED IN ALT_PHONE INTO THE EMAIL COLUMN
UPDATE public.profiles 
SET email = lower(trim(alt_phone))
WHERE (email IS NULL OR email = '') 
  AND alt_phone IS NOT NULL 
  AND alt_phone LIKE '%@%';

-- 3. ENSURE EXISTING REGISTERED USERS ARE MARKED AS ONBOARDED
UPDATE public.profiles
SET onboarding_completed = TRUE, profile_completed = TRUE
WHERE role IS NOT NULL;

-- 4. CASE-INSENSITIVE ROLE CONSTRAINT MIGRATION
DO $$
BEGIN
  -- Drop existing check constraint if any
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  -- Add flexible case-insensitive check
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (upper(role) IN ('CUSTOMER', 'WORKER', 'CONTRACTOR', 'ADMIN', 'ADMIN_GATEWAY'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 5. SAFELY ADD MISSING COLUMNS TO WORKER_PROFILES TABLE
ALTER TABLE public.worker_profiles 
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. CREATE BOOKINGS TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT UNIQUE,
  customer_id UUID REFERENCES public.profiles(id),
  customer_name TEXT,
  customer_phone TEXT,
  worker_id UUID REFERENCES public.profiles(id),
  worker_profile_id UUID REFERENCES public.worker_profiles(id),
  worker_name TEXT,
  worker_phone TEXT,
  worker_skill TEXT,
  category TEXT,
  title TEXT,
  site_location TEXT,
  site_lat NUMERIC,
  site_lng NUMERIC,
  scheduled_date TEXT DEFAULT 'Today, Immediate',
  duration TEXT DEFAULT '1 Day',
  booking_fee INTEGER DEFAULT 99,
  worker_fee INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 99,
  transaction_fee INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 99,
  payment_status TEXT DEFAULT 'PENDING',
  status TEXT DEFAULT 'waiting_confirmation' CHECK (status IN ('waiting_confirmation', 'confirmed', 'active', 'in_progress', 'completed', 'cancelled', 'refunded', 'rejected')),
  progress_step INTEGER DEFAULT 1,
  arrival_otp TEXT DEFAULT '4821',
  completion_otp TEXT DEFAULT '8394',
  cancellation_otp TEXT DEFAULT '1592',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  payment_method TEXT DEFAULT 'Razorpay',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE CONTRACTOR BOOKINGS TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.contractor_bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT UNIQUE,
  customer_name TEXT,
  customer_phone TEXT,
  site_location TEXT,
  duration TEXT,
  total_workers INTEGER,
  crew_breakdown JSONB,
  assigned_workers JSONB,
  subtotal INTEGER,
  platform_fee INTEGER DEFAULT 99,
  transaction_fee INTEGER DEFAULT 48,
  total_amount INTEGER,
  status TEXT DEFAULT 'waiting_confirmation',
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE REVIEWS TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT,
  worker_id UUID,
  customer_name TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREATE PLATFORM SETTINGS TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  commission_rate NUMERIC(4, 2) DEFAULT 0.0,
  platform_fee INTEGER DEFAULT 99,
  banner_announcement TEXT DEFAULT 'Welcome to Mistri Pro! Verified mistris available on demand.',
  base_daily_rates JSONB DEFAULT '{"mason": 950, "electrician": 850, "plumber": 850, "painter": 800, "carpenter": 900, "labour": 600}'::jsonb,
  training_videos JSONB DEFAULT '[]'::jsonb,
  support_contact JSONB DEFAULT '{"phone": "+919057631403", "email": "mistripro.ind@gmail.com"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings if empty
INSERT INTO public.platform_settings (id, commission_rate, platform_fee)
VALUES ('global', 0.0, 99)
ON CONFLICT (id) DO NOTHING;

-- 10. AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH USERS
-- Whenever a user signs up via Email, Google OAuth, or Phone, automatically create a linked profile
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
  extracted_phone TEXT;
BEGIN
  -- Extract name from metadata or email prefix
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' ')),
    'MistriPro User'
  );
  
  extracted_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NULL
  );

  INSERT INTO public.profiles (
    id,
    email,
    phone,
    full_name,
    avatar_url,
    role,
    preferred_language,
    onboarding_completed,
    profile_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    extracted_phone,
    extracted_name,
    NEW.raw_user_meta_data->>'avatar_url',
    NULL, -- Role remains NULL until selected on Role Screen
    'en',
    FALSE,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger idempotently
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper to safely recreate policies
DO $$
BEGIN
  -- PROFILES: Users read their own profile, or workers' public profile
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (
      auth.uid() = id 
      OR upper(role) IN ('WORKER', 'CONTRACTOR')
      OR role IS NULL
    );

  -- PROFILES: Users can insert their own profile
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
      auth.uid() = id OR auth.uid() IS NULL
    );

  -- PROFILES: Users can update their own profile
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (
      auth.uid() = id OR auth.uid() IS NULL
    ) WITH CHECK (
      auth.uid() = id OR auth.uid() IS NULL
    );

  -- WORKER PROFILES: Anyone can view verified/available workers
  DROP POLICY IF EXISTS "Public can view workers" ON public.worker_profiles;
  CREATE POLICY "Public can view workers" ON public.worker_profiles
    FOR SELECT USING (true);

  -- WORKER PROFILES: Workers can update their own details
  DROP POLICY IF EXISTS "Workers can update own profile" ON public.worker_profiles;
  CREATE POLICY "Workers can update own profile" ON public.worker_profiles
    FOR ALL USING (
      auth.uid() = user_id OR auth.uid() IS NULL
    ) WITH CHECK (
      auth.uid() = user_id OR auth.uid() IS NULL
    );

  -- BOOKINGS: Permissive for active operations
  DROP POLICY IF EXISTS "Bookings read policy" ON public.bookings;
  CREATE POLICY "Bookings read policy" ON public.bookings
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Bookings insert policy" ON public.bookings;
  CREATE POLICY "Bookings insert policy" ON public.bookings
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Bookings update policy" ON public.bookings;
  CREATE POLICY "Bookings update policy" ON public.bookings
    FOR UPDATE USING (true);

  -- PLATFORM SETTINGS: Public read
  DROP POLICY IF EXISTS "Public read platform settings" ON public.platform_settings;
  CREATE POLICY "Public read platform settings" ON public.platform_settings
    FOR SELECT USING (true);
END $$;

-- 12. STORAGE BUCKET FOR WORKER KYC AADHAAR
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read kyc-documents" ON storage.objects;
  CREATE POLICY "Public read kyc-documents" ON storage.objects 
    FOR SELECT USING (bucket_id = 'kyc-documents');

  DROP POLICY IF EXISTS "Public upload kyc-documents" ON storage.objects;
  CREATE POLICY "Public upload kyc-documents" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'kyc-documents');

  DROP POLICY IF EXISTS "Public update kyc-documents" ON storage.objects;
  CREATE POLICY "Public update kyc-documents" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'kyc-documents');
END $$;
