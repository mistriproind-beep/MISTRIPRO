-- ========================================================
-- MISTRI PRO: CLEAN SUPABASE DATABASE SCHEMA
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Customers & Workers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT DEFAULT 'CUSTOMER',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'Jaipur',
  state TEXT DEFAULT 'Rajasthan',
  kyc_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Worker Profiles Table (Skills, Aadhaar, Rates)
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 1,
  daily_rate NUMERIC DEFAULT 800,
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Requirements Table (Customer Posted Jobs / Tenders)
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  bids_count INT DEFAULT 0,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bids Table (Worker Quotations)
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_amount NUMERIC NOT NULL,
  proposal_note TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID REFERENCES public.requirements(id),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating NUMERIC DEFAULT 5.0,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow Public Access Policies (for testing & development)
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public worker profiles access" ON public.worker_profiles;
CREATE POLICY "Public worker profiles access" ON public.worker_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public requirements access" ON public.requirements;
CREATE POLICY "Public requirements access" ON public.requirements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public bids access" ON public.bids;
CREATE POLICY "Public bids access" ON public.bids FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public reviews access" ON public.reviews;
CREATE POLICY "Public reviews access" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
