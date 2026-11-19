'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Percent,
  IndianRupee,
  Save,
  Lock,
  Key,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  CreditCard,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  Mail,
  Headphones,
  Video,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
} from 'lucide-react';

const GATEWAY_CONFIG_PROFILE_ID = '00000000-0000-0000-0000-000000000099';
const SUPPORT_CONFIG_PROFILE_ID = '00000000-0000-0000-0000-000000000088';

export default function SettingsPage() {
  const { updatePassword, adminEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Platform Rates State
  const [commissionRate, setCommissionRate] = useState<number>(5.0);
  const [platformFee, setPlatformFee] = useState<number>(99);
  const [bannerAnnouncement, setBannerAnnouncement] = useState(
    'Welcome to Mistri Pro! Verified mistris available on demand with 100% payment protection.'
  );

  const [tradeRates, setTradeRates] = useState<Record<string, number>>({
    mason: 950,
    electrician: 850,
    plumber: 850,
    painter: 800,
    carpenter: 900,
    labour: 600,
    tile: 950,
  });

  // Platform Phone & Direct Pricing Settings
  const [companyPhone, setCompanyPhone] = useState('+91 98290 12345');
  const [bookingFee, setBookingFee] = useState(99);
  const [milestoneBonus, setMilestoneBonus] = useState(200);

  // Razorpay Gateway Credentials State
  const [rzpKeyId, setRzpKeyId] = useState('rzp_test_U1wrThfCLVtNL9');
  const [rzpKeySecret, setRzpKeySecret] = useState('dihnHCgzXlEPswRiIPZ2GoeG');
  const [rzpMode, setRzpMode] = useState<'live' | 'test'>('test');
  const [rzpMerchantName, setRzpMerchantName] = useState('Mistri Pro Secured Payments');
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState('');
  const [rzpEnabled, setRzpEnabled] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [rzpSaving, setRzpSaving] = useState(false);
  const [rzpLastSynced, setRzpLastSynced] = useState<string | null>(null);
  const [rzpMsg, setRzpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Help Center & Support Helpline State (Dynamic In-App Help Center)
  const [supportPhone, setSupportPhone] = useState('+919057631403');
  const [supportEmail, setSupportEmail] = useState('mistripro.ind@gmail.com');
  const [supportSaving, setSupportSaving] = useState(false);
  const [supportMsg, setSupportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Worker Training Academy Videos State (Dynamic Video Manager)
  const [trainingVideos, setTrainingVideos] = useState<any[]>([
    {
      id: 'tut-1',
      title: 'How to Get 5-Star Ratings on Mistri Pro',
      hindiTitle: 'मिस्त्री प्रो पर 5-स्टार रेटिंग और ज्यादा काम कैसे पाएं',
      duration: '4:20 min',
      channel: 'Mistri Pro Academy',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
      tag: 'Tips & Growth',
    },
  ]);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Fetch current live settings and Razorpay credentials from Supabase
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // 1. Fetch Razorpay Gateway Credentials from Supabase
      const { data: gwData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', GATEWAY_CONFIG_PROFILE_ID)
        .maybeSingle();

      if (gwData?.address) {
        try {
          const parsed = JSON.parse(gwData.address);
          if (parsed.key_id) setRzpKeyId(parsed.key_id);
          if (parsed.key_secret) setRzpKeySecret(parsed.key_secret);
          if (parsed.mode) setRzpMode(parsed.mode);
          if (parsed.merchant_name) setRzpMerchantName(parsed.merchant_name);
          if (parsed.webhook_secret !== undefined) setRzpWebhookSecret(parsed.webhook_secret);
          if (parsed.enabled !== undefined) setRzpEnabled(parsed.enabled);
          if (parsed.company_phone) setCompanyPhone(parsed.company_phone);
          if (parsed.booking_fee !== undefined) setBookingFee(Number(parsed.booking_fee));
          if (parsed.milestone_bonus !== undefined) setMilestoneBonus(Number(parsed.milestone_bonus));
          if (gwData.updated_at) setRzpLastSynced(new Date(gwData.updated_at).toLocaleTimeString());
        } catch (e) {
          console.log('Error parsing razorpay json:', e);
        }
      }

      // 2. Fetch platform rates if table configured
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('id', 'global')
          .maybeSingle();

        if (data) {
          if (data.commission_rate !== undefined) setCommissionRate(Number(data.commission_rate));
          if (data.platform_fee !== undefined) setPlatformFee(Number(data.platform_fee));
          if (data.banner_announcement) setBannerAnnouncement(data.banner_announcement);
          if (data.base_daily_rates) setTradeRates(data.base_daily_rates);
          if (data.updated_at) setLastSynced(new Date(data.updated_at).toLocaleTimeString());
        }
      } catch (err: any) {
        console.log('platform_settings note:', err.message);
      }

      // 3. Fetch Help Center Support & Training Videos from Supabase
      try {
        const { data: supportData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', SUPPORT_CONFIG_PROFILE_ID)
          .maybeSingle();

        if (supportData?.address) {
          try {
            const parsed = JSON.parse(supportData.address);
            if (parsed.support_phone) setSupportPhone(parsed.support_phone);
            if (parsed.support_email) setSupportEmail(parsed.support_email);
            if (Array.isArray(parsed.training_videos) && parsed.training_videos.length > 0) {
              setTrainingVideos(parsed.training_videos);
            }
          } catch (e) {
            console.log('Error parsing support config JSON:', e);
          }
        }
      } catch (sErr: any) {
        console.log('Support config fetch notice:', sErr?.message);
      }
    } catch (err: any) {
      console.log('Error reading settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Razorpay Gateway Credentials to Supabase Cloud
  const handleSaveRazorpayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setRzpSaving(true);
    setRzpMsg(null);
    try {
      const payload = {
        key_id: rzpKeyId.trim(),
        key_secret: rzpKeySecret.trim(),
        mode: rzpMode,
        merchant_name: rzpMerchantName.trim() || 'Mistri Pro Secured Payments',
        webhook_secret: rzpWebhookSecret.trim(),
        enabled: rzpEnabled,
        company_phone: companyPhone.trim() || '+91 98290 12345',
        booking_fee: Number(bookingFee) || 99,
        milestone_bonus: Number(milestoneBonus) || 200,
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

      if (error) throw error;

      setRzpLastSynced(new Date().toLocaleTimeString());
      setRzpMsg({
        type: 'success',
        text: 'Razorpay credentials saved to Supabase Cloud! Live mobile apps and customer checkouts are now using these credentials in real-time.',
      });
    } catch (err: any) {
      setRzpMsg({ type: 'error', text: `Failed to save credentials: ${err.message}` });
    } finally {
      setRzpSaving(false);
    }
  };

  // Save Support Helpline & Training Videos to Supabase Cloud
  const handleSaveSupportAndVideos = async (customVideos?: any[]) => {
    setSupportSaving(true);
    setSupportMsg(null);
    try {
      const videosToSave = customVideos || trainingVideos;
      const payload = {
        support_phone: supportPhone.trim(),
        support_email: supportEmail.trim(),
        training_videos: videosToSave,
      };

      const { error } = await supabase.from('profiles').upsert([
        {
          id: SUPPORT_CONFIG_PROFILE_ID,
          role: 'ADMIN',
          full_name: 'MistriPro Support & Training Video Config',
          phone: payload.support_phone,
          alt_phone: payload.support_email,
          address: JSON.stringify(payload),
          city: 'CONFIG',
          state: 'ACTIVE',
          kyc_status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setSupportMsg({
        type: 'success',
        text: 'Support Helpline and Training Videos saved to Supabase! Mobile apps update dynamically.',
      });
    } catch (err: any) {
      setSupportMsg({ type: 'error', text: 'Failed to save support settings: ' + err.message });
    } finally {
      setSupportSaving(false);
    }
  };

  const handleDeleteVideo = (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    const updated = trainingVideos.filter((v) => v.id !== id);
    setTrainingVideos(updated);
    handleSaveSupportAndVideos(updated);
  };

  const handleSaveVideoModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    let updated: any[];
    if (editingVideo.isNew) {
      const newV = {
        ...editingVideo,
        id: `vid-${Date.now()}`,
      };
      delete newV.isNew;
      updated = [...trainingVideos, newV];
    } else {
      updated = trainingVideos.map((v) => (v.id === editingVideo.id ? editingVideo : v));
    }
    setTrainingVideos(updated);
    setShowVideoModal(false);
    setEditingVideo(null);
    handleSaveSupportAndVideos(updated);
  };

  // Save Platform Rates to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: 'global',
        commission_rate: commissionRate,
        platform_fee: platformFee,
        banner_announcement: bannerAnnouncement,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('platform_settings')
        .upsert([payload]);

      if (error) throw error;

      setLastSynced(new Date().toLocaleTimeString());
      alert('Platform settings saved successfully! All mobile app clients will instantly receive these rates.');
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await updatePassword(oldPassword, newPassword);
      if (res.success) {
        setPwdMsg({ type: 'success', text: 'Super Admin password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch {
      setPwdMsg({ type: 'error', text: 'An unexpected error occurred while saving password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Platform Rates & Super Admin Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure live Razorpay payment gateway credentials, commission rates, and manage administrative security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {rzpLastSynced && (
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Supabase Synced: {rzpLastSynced}
            </span>
          )}
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            <span>Reload Config</span>
          </button>
        </div>
      </div>

      {/* ─── RAZORPAY LIVE GATEWAY CREDENTIALS SECTION ─── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <form onSubmit={handleSaveRazorpayConfig} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Razorpay Payment Gateway Credentials</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rzpMode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rzpMode === 'live' ? 'LIVE PRODUCTION' : 'TEST SANDBOX'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Credentials saved directly to Supabase. Mobile app reads these live credentials for real-time customer checkouts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Supabase Sync
              </span>
            </div>
          </div>

          {rzpMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                rzpMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {rzpMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{rzpMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Razorpay Key ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Razorpay Key ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={rzpKeyId}
                  onChange={(e) => setRzpKeyId(e.target.value)}
                  placeholder="rzp_live_... or rzp_test_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Found in Razorpay Dashboard → Settings → API Keys.
              </p>
            </div>

            {/* Razorpay Key Secret */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Razorpay Key Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={rzpKeySecret}
                  onChange={(e) => setRzpKeySecret(e.target.value)}
                  placeholder="Enter Razorpay Secret Key"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Stored securely in Supabase Cloud.
              </p>
            </div>

            {/* Gateway Mode Switch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gateway Environment Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRzpMode('live')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    rzpMode === 'live'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${rzpMode === 'live' ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span>Live Production</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRzpMode('test')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    rzpMode === 'test'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${rzpMode === 'test' ? 'bg-white' : 'bg-amber-500'}`} />
                  <span>Test Sandbox</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Toggle between live real transactions and sandbox testing.
              </p>
            </div>

            {/* Merchant Brand Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Merchant Brand Name
              </label>
              <input
                type="text"
                value={rzpMerchantName}
                onChange={(e) => setRzpMerchantName(e.target.value)}
                placeholder="Mistri Pro Secured Payments"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Brand name displayed on customer's UPI & Card checkout screen.
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Razorpay Webhook Secret (Optional)
              </label>
              <input
                type="text"
                value={rzpWebhookSecret}
                onChange={(e) => setRzpWebhookSecret(e.target.value)}
                placeholder="Webhook secret for payment verification callbacks"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            {/* Company Dispatch Helpline Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Company Dispatch Helpline Phone (Mask Worker Numbers)</span>
              </label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="+91 98290 12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Customers call this company number instead of worker personal phone numbers.
              </p>
            </div>

            {/* Customer Site Visit & Booking Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                <span>Site Visit & Inspection Fee (₹)</span>
              </label>
              <input
                type="number"
                value={bookingFee}
                onChange={(e) => setBookingFee(Number(e.target.value))}
                placeholder="99"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Fixed nominal charge customer pays to book mistri site visit. Work price is quoted on-site.
              </p>
            </div>

            {/* Worker 10-Job Milestone Reward */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Worker 10-Job Milestone Reward Bonus (₹)</span>
              </label>
              <input
                type="number"
                value={milestoneBonus}
                onChange={(e) => setMilestoneBonus(Number(e.target.value))}
                placeholder="200"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Cash bonus automatically credited to worker wallet for every 10 completed jobs.
              </p>
            </div>

            {/* Gateway Active Toggle */}
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Gateway Status
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRzpEnabled(!rzpEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    rzpEnabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {rzpEnabled ? '✓ Gateway Active & Accepting Payments' : '✕ Gateway Paused / Maintenance'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All mobile checkouts dynamically query Supabase for these live keys.</span>
            </div>

            <button
              type="submit"
              disabled={rzpSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{rzpSaving ? 'Saving to Supabase...' : 'Save Razorpay Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Support Helpline & Help Center Contact Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>In-App Help Center Contact & Helpline</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Direct 1-Tap Dial & Email
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                When customers or workers tap &quot;Help Center & FAQ&quot;, this phone and email open with 1 tap.
              </p>
            </div>
          </div>
        </div>

        {supportMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              supportMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {supportMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{supportMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-600" />
              <span>Support Phone Number</span>
            </label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="+919057631403"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600 focus:bg-white transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Triggers instant phone dialer (<span className="font-mono">tel:{supportPhone}</span>) in mobile app.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Support Email Address</span>
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="mistripro.ind@gmail.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600 focus:bg-white transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Triggers default email app (<span className="font-mono">mailto:{supportEmail}</span>) in mobile app.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Saved under Supabase cloud config ID <span className="font-mono text-slate-600 font-bold">...0088</span>
          </p>
          <button
            type="button"
            onClick={() => handleSaveSupportAndVideos()}
            disabled={supportSaving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{supportSaving ? 'Saving to Supabase...' : 'Save Support Contact'}</span>
          </button>
        </div>
      </div>

      {/* Worker Training Academy Videos Manager */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Worker Training Academy Videos</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  {trainingVideos.length} Videos Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Update URLs, thumbnails, and regional titles of tutorials shown on Worker HomeScreen.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingVideo({
                isNew: true,
                title: '',
                hindiTitle: '',
                url: '',
                thumbnail: '',
                duration: '4:00 min',
                channel: 'MistriPro Academy',
                tag: 'General',
              });
              setShowVideoModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Training Video</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingVideos.map((video) => (
            <div
              key={video.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-slate-200">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Video className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {video.duration || 'Video'}
                  </span>
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {video.tag || 'Tutorial'}
                  </span>
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{video.title}</h4>
                  {video.hindiTitle && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">{video.hindiTitle}</p>
                  )}
                  <p className="text-[10px] text-slate-400">{video.channel || 'MistriPro'}</p>
                </div>
              </div>

              <div className="p-3 pt-0 border-t border-slate-200/60 mt-2 flex items-center justify-between">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Preview</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideo({ ...video, isNew: false });
                      setShowVideoModal(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                    title="Edit Video"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Add / Edit Modal */}
      {showVideoModal && editingVideo && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingVideo.isNew ? 'Add Training Video' : 'Edit Training Video'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowVideoModal(false);
                  setEditingVideo(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideoModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.title || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="e.g. How to Greet Customers & Verify OTP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Regional / Hindi Title (Optional)
                </label>
                <input
                  type="text"
                  value={editingVideo.hindiTitle || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, hindiTitle: e.target.value })}
                  placeholder="उदा. ग्राहक की साइट पर व्यवहार व OTP प्रक्रिया"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube / Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingVideo.url || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingVideo.thumbnail || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/... or img.youtube.com/vi/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (e.g. 4:20 min)
                  </label>
                  <input
                    type="text"
                    value={editingVideo.duration || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    placeholder="4:20 min"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tag / Category
                  </label>
                  <input
                    type="text"
                    value={editingVideo.tag || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, tag: e.target.value })}
                    placeholder="Safety / Earnings"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVideoModal(false);
                    setEditingVideo(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Platform Rates & Wage Matrix */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Marketplace Fees & Commission</h3>
                  <p className="text-xs text-slate-500">Live rates applied during customer checkout</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Auto Sync Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Platform Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Deducted from gross booking value.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Convenience / Booking Fee (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Fixed per-booking platform charge.</p>
              </div>
            </div>

            {/* In-App Announcement */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                In-App Customer Announcement
              </label>
              <textarea
                value={bannerAnnouncement}
                onChange={(e) => setBannerAnnouncement(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                placeholder="Broadcast text displayed on mobile homescreen..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save & Publish Rates'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Admin Security & Credentials */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-5"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Security</h3>
                <p className="text-xs text-slate-500">Change your superuser credentials</p>
              </div>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {pwdMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Admin Email
              </label>
              <input
                type="text"
                disabled
                value={adminEmail || 'admin@mistripro.com'}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Superuser Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              {pwdLoading ? 'Updating Password...' : 'Update Admin Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
