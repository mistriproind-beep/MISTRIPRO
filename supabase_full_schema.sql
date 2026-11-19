-- ==============================================================================
-- MISTRI PRO - COMPLETE PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jmdijseowvqvldlhhwsp/sql
-- Safe & Idempotent: Can be run on new or existing database without syntax errors
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  alt_phone TEXT,
  full_name TEXT NOT NULL DEFAULT 'MistriPro User',
  avatar_url TEXT,
  role TEXT CHECK (upper(role) IN ('CUSTOMER', 'WORKER', 'CONTRACTOR', 'ADMIN', 'ADMIN_GATEWAY')),
  preferred_language TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  address TEXT,
  city TEXT DEFAULT 'Sawai Madhopur',
  state TEXT DEFAULT 'Rajasthan',
  pincode TEXT,
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'VERIFIED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. WORKER PROFILES TABLE (Trade skills, rates, availability & ratings)
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 5,
  daily_rate INTEGER DEFAULT 800,
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON public.worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_availability ON public.worker_profiles(is_available);

-- 3. BOOKINGS TABLE (Individual Customer -> Worker Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_profile_id UUID REFERENCES public.worker_profiles(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON public.bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_worker_phone ON public.bookings(worker_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 4. CONTRACTOR CREW BOOKINGS TABLE (Multi-Worker Deployments)
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

-- 5. WORKER REQUESTS / BROADCAST ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.worker_requests (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  worker_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  category TEXT,
  title TEXT,
  location TEXT,
  offered_rate INTEGER,
  platform_fee INTEGER DEFAULT 99,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLATFORM SETTINGS & LIVE RATE CONTROLS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  commission_rate NUMERIC(4, 2) DEFAULT 0.0,
  platform_fee INTEGER DEFAULT 99,
  base_daily_rates JSONB DEFAULT '{"mason": 950, "electrician": 850, "plumber": 850, "painter": 800, "carpenter": 900, "labour": 600}'::jsonb,
  banner_announcement TEXT DEFAULT 'Welcome to Mistri Pro! Verified mistris available on demand.',
  training_videos JSONB DEFAULT '[]'::jsonb,
  support_contact JSONB DEFAULT '{"phone": "+919057631403", "email": "mistripro.ind@gmail.com"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.platform_settings (id, commission_rate, platform_fee)
VALUES ('global', 0.0, 99)
ON CONFLICT (id) DO NOTHING;

-- 8. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
  extracted_phone TEXT;
BEGIN
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
    NULL,
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- PROFILES POLICIES
  DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
  CREATE POLICY "Profiles read policy" ON public.profiles
    FOR SELECT USING (
      auth.uid() = id 
      OR upper(role) IN ('WORKER', 'CONTRACTOR')
      OR role IS NULL
    );

  DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
  CREATE POLICY "Profiles insert policy" ON public.profiles
    FOR INSERT WITH CHECK (
      auth.uid() = id OR auth.uid() IS NULL
    );

  DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
  CREATE POLICY "Profiles update policy" ON public.profiles
    FOR UPDATE USING (
      auth.uid() = id OR auth.uid() IS NULL
    ) WITH CHECK (
      auth.uid() = id OR auth.uid() IS NULL
    );

  -- WORKER PROFILES POLICIES
  DROP POLICY IF EXISTS "Public can view workers" ON public.worker_profiles;
  CREATE POLICY "Public can view workers" ON public.worker_profiles
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Workers can update own profile" ON public.worker_profiles;
  CREATE POLICY "Workers can update own profile" ON public.worker_profiles
    FOR ALL USING (
      auth.uid() = user_id OR auth.uid() IS NULL
    ) WITH CHECK (
      auth.uid() = user_id OR auth.uid() IS NULL
    );

  -- BOOKINGS POLICIES
  DROP POLICY IF EXISTS "Public read bookings" ON public.bookings;
  CREATE POLICY "Public read bookings" ON public.bookings
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
  CREATE POLICY "Public insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Public update bookings" ON public.bookings;
  CREATE POLICY "Public update bookings" ON public.bookings
    FOR UPDATE USING (true);

  -- SETTINGS & REVIEWS
  DROP POLICY IF EXISTS "Public read platform settings" ON public.platform_settings;
  CREATE POLICY "Public read platform settings" ON public.platform_settings
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
  CREATE POLICY "Public read reviews" ON public.reviews
    FOR SELECT USING (true);
END $$;

-- 10. STORAGE BUCKET FOR WORKER KYC AADHAAR
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
