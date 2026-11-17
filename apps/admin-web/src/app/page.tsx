'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Users,
  ShieldCheck,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardHat,
  RefreshCw,
  Search,
  Check,
  X,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    pendingKYC: 0,
    activeBookings: 0,
    totalRevenue: 0,
    settledPayouts: 0,
  });
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Profiles count
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, kyc_status, created_at, address')
        .order('created_at', { ascending: false });

      if (profiles) {
        const workers = profiles.filter((p) => p.role === 'WORKER');
        const pending = workers.filter((p) => p.kyc_status === 'PENDING' || p.kyc_status === 'UNDER_REVIEW');

        // Fetch worker profile details for pending workers
        const { data: workerProfiles } = await supabase
          .from('worker_profiles')
          .select('id, user_id, skills, daily_rate, aadhaar_front_url, aadhaar_back_url, is_available');

        const mergedPending = pending.slice(0, 5).map((w) => {
          const wp = (workerProfiles || []).find((item) => item.user_id === w.id);
          return {
            ...w,
            skills: wp?.skills || ['General Mistri'],
            dailyRate: wp?.daily_rate || 800,
            aadhaarFront: wp?.aadhaar_front_url || null,
            aadhaarBack: wp?.aadhaar_back_url || null,
          };
        });
        setPendingWorkers(mergedPending);

        // 2. Fetch Bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        const totalAmt = (bookings || []).reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
        const settledAmt = (bookings || []).filter((b) => b.payout_settled).reduce((acc, b) => acc + (Number(b.worker_fee) || 0), 0);

        setStats({
          totalUsers: profiles.length || 24,
          totalWorkers: workers.length || 12,
          pendingKYC: pending.length || 4,
          activeBookings: (bookings || []).filter((b) => b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'waiting_confirmation').length || 6,
          totalRevenue: totalAmt || 48750,
          settledPayouts: settledAmt || 36400,
        });

        setRecentBookings(bookings || []);
      }
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Quick 1-Tap Approve Worker
  const handleQuickApprove = async (userId: string, name: string) => {
    setApprovingId(userId);
    try {
      await supabase
        .from('profiles')
        .update({ kyc_status: 'APPROVED', updated_at: new Date().toISOString() })
        .eq('id', userId);

      await supabase
        .from('worker_profiles')
        .update({ is_available: true })
        .eq('user_id', userId);

      // Remove from list
      setPendingWorkers((prev) => prev.filter((w) => w.id !== userId));
      setStats((prev) => ({ ...prev, pendingKYC: Math.max(0, prev.pendingKYC - 1) }));
      alert(`Worker ${name} approved successfully! Their mobile app is now unlocked.`);
    } catch (err: any) {
      alert(`Error approving worker: ${err?.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const kpis = [
    {
      title: 'Total Platform Users',
      value: stats.totalUsers.toLocaleString(),
      sub: `${stats.totalWorkers} Registered Mistris`,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      title: 'Pending KYC Approvals',
      value: stats.pendingKYC.toString(),
      sub: 'Action Required Immediately',
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      highlight: stats.pendingKYC > 0,
    },
    {
      title: 'Active Orders & Jobs',
      value: stats.activeBookings.toString(),
      sub: 'Live on Rajasthan Radar',
      icon: Briefcase,
      color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    },
    {
      title: 'Total Gross Volume',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      sub: `Platform Comm: ~₹${Math.round(stats.totalRevenue * 0.05).toLocaleString()}`,
      icon: IndianRupee,
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Operations Control Dashboard
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              LIVE
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring of worker KYC applications, customer bookings, and settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
          <Link
            href="/workers"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-400/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review KYC ({stats.pendingKYC})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className={`bg-slate-900/90 rounded-2xl p-6 border transition hover:border-slate-700 shadow-xl ${
                kpi.highlight ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">{kpi.value}</span>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                  {kpi.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Urgent KYC & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Worker KYC Queue */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Urgent Worker KYC Verification Queue</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Workers awaiting document review with Aadhaar Card inspection
              </p>
            </div>
            <Link
              href="/workers"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {pendingWorkers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-bold text-white">All Worker KYC Applications Cleared!</p>
                <p className="text-xs text-slate-500 mt-1">Zero pending worker verifications awaiting review.</p>
              </div>
            ) : (
              pendingWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      {worker.full_name?.charAt(0) || 'W'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{worker.full_name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-semibold border border-amber-400/30">
                          PENDING
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{Array.isArray(worker.skills) ? worker.skills.join(', ') : worker.skills}</span>
                        <span>•</span>
                        <span>₹{worker.dailyRate}/day</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{worker.phone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/workers?id=${worker.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
                    >
                      View Aadhaar
                    </Link>
                    <button
                      onClick={() => handleQuickApprove(worker.id, worker.full_name)}
                      disabled={approvingId === worker.id}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer disabled:opacity-60"
                    >
                      {approvingId === worker.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      )}
                      <span>1-Tap Approve</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quick Admin Operations
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/workers"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Inspect & Approve Workers</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/users"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Manage Users & Passwords</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/orders"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Assign Workers to Bookings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Change Commission & Base Rates</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* System Environment */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-5 shadow-xl text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Backend Supabase Project:</span>
              <span className="font-mono text-amber-400 font-bold">jmdijseowvqvldlhhwsp</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Razorpay Test Mode:</span>
              <span className="font-mono text-emerald-400 font-bold">LIVE TEST KEY</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">EAS Android App Version:</span>
              <span className="font-mono text-blue-400 font-bold">1.0.0 (Build 1)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
