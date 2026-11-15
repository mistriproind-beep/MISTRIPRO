-- ========================================================
-- MISTRI PRO: PRODUCTION SUPABASE DATABASE SCHEMA
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Customers, Workers, Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT DEFAULT 'CUSTOMER', -- 'CUSTOMER' | 'WORKER' | 'ADMIN'
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  alt_phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'Sawai Madhopur',
  state TEXT DEFAULT 'Rajasthan',
  kyc_status TEXT DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
  is_approved BOOLEAN DEFAULT false,
  is_dev BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Worker Profiles Table (Skills, Aadhaar, Rates, Live Availability)
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 1,
  daily_rate NUMERIC DEFAULT 950,
  rate_type TEXT DEFAULT 'day', -- 'day' | 'hour'
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  completed_jobs_count INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  current_lat NUMERIC DEFAULT 26.0124,
  current_lng NUMERIC DEFAULT 76.3533,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bookings Table (Customer to Worker Live Job Lifecycle)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_name TEXT NOT NULL,
  worker_phone TEXT NOT NULL,
  worker_skill TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  site_location TEXT NOT NULL,
  site_lat NUMERIC,
  site_lng NUMERIC,
  scheduled_date TEXT NOT NULL,
  duration TEXT DEFAULT '1 Day',
  worker_fee NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 99,
  transaction_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'WAITING_CONFIRMATION', -- 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REFUNDED'
  progress_step INT DEFAULT 1, -- 1: Approved, 2: Visited Site, 3: Work in Progress, 4: Work Done
  escrow_status TEXT DEFAULT 'LOCKED_IN_ESCROW', -- 'LOCKED_IN_ESCROW' | 'PAID_TO_WALLET' | 'REFUNDED'
  rating NUMERIC,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Contractor Group Bookings Table
CREATE TABLE IF NOT EXISTS public.contractor_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  contractor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  contractor_name TEXT NOT NULL,
  contractor_phone TEXT NOT NULL,
  site_location TEXT NOT NULL,
  duration TEXT NOT NULL,
  total_workers INT NOT NULL,
  crew_breakdown JSONB NOT NULL,
  assigned_workers JSONB DEFAULT '[]',
  subtotal NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 99,
  transaction_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Withdrawal Requests Table (Worker Wallet Payouts)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  worker_name TEXT NOT NULL,
  worker_phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payout_method TEXT NOT NULL, -- 'UPI' | 'BANK'
  payout_details JSONB NOT NULL,
  status TEXT DEFAULT 'PENDING', -- 'PENDING' | 'PROCESSED' | 'REJECTED'
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Notifications Table (Live Push/In-App Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO', -- 'BOOKING' | 'APPROVAL' | 'ALERT' | 'ESCROW' | 'INFO'
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Reviews Table (Customer Feedback & Ratings)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow Public Access Policies (for testing & development)
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public worker profiles access" ON public.worker_profiles;
CREATE POLICY "Public worker profiles access" ON public.worker_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public bookings access" ON public.bookings;
CREATE POLICY "Public bookings access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public contractor bookings access" ON public.contractor_bookings;
CREATE POLICY "Public contractor bookings access" ON public.contractor_bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public withdrawal requests access" ON public.withdrawal_requests;
CREATE POLICY "Public withdrawal requests access" ON public.withdrawal_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public notifications access" ON public.notifications;
CREATE POLICY "Public notifications access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public reviews access" ON public.reviews;
CREATE POLICY "Public reviews access" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
