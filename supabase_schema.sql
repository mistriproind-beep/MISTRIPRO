-- ==============================================================================
-- MISTRI PRO - COMPLETE PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jmdijseowvqvldlhhwsp/sql
-- ==============================================================================

-- 1. PROFILES TABLE (Customers, Workers, Contractors, Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'WORKER', 'CONTRACTOR', 'ADMIN')),
  full_name TEXT NOT NULL,
  phone TEXT,
  alt_phone TEXT, -- used also for email login identification
  email TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'Sawai Madhopur',
  state TEXT DEFAULT 'Rajasthan',
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'VERIFIED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKER PROFILES TABLE (Trade skills, rates, availability & ratings)
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 5,
  daily_rate INTEGER DEFAULT 800,
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS TABLE (Individual Customer -> Worker Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  worker_id TEXT,
  worker_name TEXT,
  worker_phone TEXT,
  worker_skill TEXT,
  category TEXT,
  title TEXT,
  site_location TEXT,
  scheduled_date TEXT DEFAULT 'Today, Immediate',
  duration TEXT DEFAULT '1 Day',
  worker_fee INTEGER DEFAULT 950,
  platform_fee INTEGER DEFAULT 99,
  transaction_fee INTEGER DEFAULT 48,
  total_amount INTEGER DEFAULT 1097,
  status TEXT DEFAULT 'waiting_confirmation' CHECK (status IN ('waiting_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded', 'rejected')),
  progress_step INTEGER DEFAULT 1,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  payment_method TEXT DEFAULT 'Razorpay',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTRACTOR CREW BOOKINGS TABLE (Multi-Worker Deployments)
CREATE TABLE IF NOT EXISTS public.contractor_bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT,
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
  worker_id TEXT,
  customer_name TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLATFORM SETTINGS & LIVE RATE CONTROLS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  commission_rate NUMERIC(4, 2) DEFAULT 5.0,
  platform_fee INTEGER DEFAULT 99,
  base_daily_rates JSONB DEFAULT '{"mason": 950, "electrician": 850, "plumber": 850, "painter": 800, "carpenter": 900, "labour": 600}'::jsonb,
  banner_announcement TEXT DEFAULT 'Welcome to Mistri Pro! Verified mistris available on demand.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.platform_settings (id, commission_rate, platform_fee)
VALUES ('global', 5.0, 99)
ON CONFLICT (id) DO NOTHING;

-- 8. STORAGE BUCKET FOR WORKER KYC AADHAAR DOCUMENTS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read & upload on kyc-documents bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read kyc-documents') THEN
    CREATE POLICY "Public read kyc-documents" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public upload kyc-documents') THEN
    CREATE POLICY "Public upload kyc-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update kyc-documents') THEN
    CREATE POLICY "Public update kyc-documents" ON storage.objects FOR UPDATE USING (bucket_id = 'kyc-documents');
  END IF;
END $$;

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow full public read/write access for mobile app & admin panel
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles access') THEN
    CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public worker_profiles access') THEN
    CREATE POLICY "Public worker_profiles access" ON public.worker_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public bookings access') THEN
    CREATE POLICY "Public bookings access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public contractor_bookings access') THEN
    CREATE POLICY "Public contractor_bookings access" ON public.contractor_bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public worker_requests access') THEN
    CREATE POLICY "Public worker_requests access" ON public.worker_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public reviews access') THEN
    CREATE POLICY "Public reviews access" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public platform_settings access') THEN
    CREATE POLICY "Public platform_settings access" ON public.platform_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ==============================================================================
-- ADMIN HELPER PROCEDURES
-- ==============================================================================
-- Quick approve a worker by phone or ID:
-- UPDATE public.profiles SET kyc_status = 'APPROVED' WHERE phone = '+91 98765 43210';
-- UPDATE public.worker_profiles SET is_available = true WHERE user_id = (SELECT id FROM public.profiles WHERE phone = '+91 98765 43210');
