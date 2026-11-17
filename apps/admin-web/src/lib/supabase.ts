import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmdijseowvqvldlhhwsp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I-_tRn1OpP7mijyP1kjtlA_DtyTGJej';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  alt_phone?: string;
  email?: string;
  role: 'CUSTOMER' | 'WORKER' | 'CONTRACTOR' | 'ADMIN';
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  kyc_status: 'PENDING' | 'APPROVED' | 'VERIFIED' | 'REJECTED';
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  worker_profiles?: WorkerProfile[];
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  skills: string[];
  experience_years: number;
  daily_rate: number;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  rating: number;
  reviews_count: number;
  is_available: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Booking {
  id: string;
  booking_code?: string;
  customer_name: string;
  customer_phone?: string;
  worker_id?: string;
  worker_name?: string;
  worker_phone?: string;
  worker_skill?: string;
  category?: string;
  title: string;
  site_location: string;
  scheduled_date?: string;
  duration?: string;
  worker_fee: number;
  platform_fee: number;
  transaction_fee: number;
  total_amount: number;
  status: 'waiting_confirmation' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded' | 'rejected';
  progress_step: number;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  payment_method?: string;
  payout_settled?: boolean;
  payout_reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface PlatformSettings {
  id: string;
  commission_rate: number;
  platform_fee: number;
  base_daily_rates: Record<string, number>;
  banner_announcement: string;
  updated_at?: string;
}
