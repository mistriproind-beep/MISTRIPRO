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

  // Save Settings Live to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: 'global',
        commission_rate: Number(commissionRate),
        platform_fee: Number(platformFee),
        banner_announcement: bannerAnnouncement.trim(),
        base_daily_rates: tradeRates,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('platform_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      setLastSynced(new Date().toLocaleTimeString());
      alert('✅ Platform rates & settings saved! Live changes synced across all customer & worker mobile apps.');
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
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await updatePassword(oldPassword, newPassword);
      if (res.success) {
        setPwdMsg({ type: 'success', text: 'Admin security password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch {
      setPwdMsg({ type: 'error', text: 'Unexpected error updating password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Platform Settings & Live Rate Controls
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              REAL-TIME SYNC
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure platform fees, base trade wage benchmarks, and admin portal security.
          </p>
        </div>

        {lastSynced && (
          <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start md:self-auto bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Last Synced: <span className="text-white font-mono">{lastSynced}</span></span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Platform Commission & Fees */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform Commission & Convenience Fees</h2>
              <p className="text-xs text-slate-400">Applies instantly to all checkout calculations and bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                Platform Commission Rate (%)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Deducted automatically as marketplace service fee (e.g. 5.0%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                Customer Convenience Fee (₹ Flat)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  max="500"
                  required
                  value={platformFee}
                  onChange={(e) => setPlatformFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Added to booking bill for customer site coordination (e.g. ₹99).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Base Daily Wages per Trade */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Base Daily Wage Benchmarks (Rajasthan Hub)</h2>
              <p className="text-xs text-slate-400">Controls default daily rates in booking forms & contractor crew planner</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { key: 'mason', label: 'Raj Mistri (Mason)' },
              { key: 'electrician', label: 'Electrician' },
              { key: 'plumber', label: 'Plumber' },
              { key: 'painter', label: 'Painter' },
              { key: 'carpenter', label: 'Carpenter (Badhai)' },
              { key: 'labour', label: 'Helper / Labour' },
              { key: 'tile', label: 'Tile & Stone Fitter' },
            ].map((trade) => (
              <div key={trade.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 truncate uppercase">
                  {trade.label}
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    step="50"
                    min="300"
                    max="5000"
                    value={tradeRates[trade.key] || 850}
                    onChange={(e) =>
                      setTradeRates({
                        ...tradeRates,
                        [trade.key]: parseInt(e.target.value) || 850,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Live In-App Announcement Banner */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live In-App Announcement Banner</h2>
              <p className="text-xs text-slate-400">Broadcast message shown at the top of Customer & Worker apps</p>
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={bannerAnnouncement}
              onChange={(e) => setBannerAnnouncement(e.target.value)}
              placeholder="Enter announcement text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Save & Sync Live with Mobile Apps</span>
          </button>
        </div>
      </form>

      {/* Section 4: Admin Portal Security & Password Change */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Admin Security Credentials</h2>
            <p className="text-xs text-slate-400">
              Signed in as <span className="text-amber-400 font-mono">{adminEmail || 'admin@mistripro.com'}</span>
            </p>
          </div>
        </div>

        {pwdMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Update Security Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
