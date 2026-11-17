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
} from 'lucide-react';

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

  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Fetch current live settings from Supabase
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (data) {
        if (data.commission_rate !== undefined) setCommissionRate(Number(data.commission_rate));
        if (data.platform_fee !== undefined) setPlatformFee(Number(data.platform_fee));
        if (data.banner_announcement) setBannerAnnouncement(data.banner_announcement);
        if (data.base_daily_rates) setTradeRates(data.base_daily_rates);
        if (data.updated_at) setLastSynced(new Date(data.updated_at).toLocaleTimeString());
      }
    } catch (err: any) {
      console.log('Error reading platform settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: 'global',
        commission_rate: commissionRate,
        platform_fee: platformFee,
        banner_announcement: bannerAnnouncement,
        base_daily_rates: tradeRates,
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
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Platform Rates & Super Admin Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure live platform commission rates, daily wage minimums, and update administrative credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastSynced && (
            <span className="text-[11px] text-slate-400">
              Synced with Supabase at {lastSynced}
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

            {/* Base Daily Wage Rates */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Base Daily Wages by Trade Category (₹/Day)
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Recommended standard daily wage rates shown on the customer booking screen.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(tradeRates).map(([trade, rate]) => (
                  <div key={trade} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 capitalize mb-1">
                      {trade}
                    </label>
                    <div className="relative">
                      <span className="text-xs text-slate-400 absolute left-2 top-1/2 -translate-y-1/2">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) =>
                          setTradeRates({ ...tradeRates, [trade]: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                ))}
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
