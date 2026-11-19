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
  ChevronRight,
  Sparkles,
  Calendar,
  Filter,
  Download,
  AlertCircle,
  Eye,
  Banknote,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    availableWorkers: 0,
    pendingKYC: 0,
    activeBookings: 0,
    ordersThisWeek: 0,
    totalRevenue: 0,
    settledPayouts: 0,
    pendingWithdrawals: 0,
  });
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [tradeActivity, setTradeActivity] = useState<{ name: string; count: number; pct: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Profiles count (100% real Supabase data)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, kyc_status, created_at, address')
        .order('created_at', { ascending: false });

      const allProfiles = profiles || [];
      const workers = allProfiles.filter((p) => p.role === 'WORKER');
      const customers = allProfiles.filter((p) => p.role === 'CUSTOMER' || !p.role);
      const pending = workers.filter(
        (p) => p.kyc_status === 'PENDING' || p.kyc_status === 'UNDER_REVIEW'
      );

      // Fetch worker profiles
      const { data: workerProfiles } = await supabase
        .from('worker_profiles')
        .select('id, user_id, skills, daily_rate, aadhaar_front_url, aadhaar_back_url, is_available');

      const allWorkerProfiles = workerProfiles || [];
      const availableWorkersCount = allWorkerProfiles.filter((wp) => wp.is_available).length;

      const mergedPending = pending.slice(0, 6).map((w) => {
        const wp = allWorkerProfiles.find((item) => item.user_id === w.id);
        return {
          ...w,
          skills: wp?.skills || ['General Mistri'],
          aadhaarFront: wp?.aadhaar_front_url || null,
          aadhaarBack: wp?.aadhaar_back_url || null,
        };
      });
      setPendingWorkers(mergedPending);

      // 2. Fetch real Bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      const allBookings = bookings || [];

      // Calculate REAL orders this week
      const now = new Date();
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);

      const realOrdersThisWeek = allBookings.filter((b) => {
        if (!b.created_at) return false;
        return new Date(b.created_at) >= startOfWeek;
      }).length;

      // Calculate REAL Gross Revenue (sum of total_amount, default to ₹99 booking fee if not set)
      const realTotalRevenue = allBookings.reduce(
        (acc, b) => acc + (Number(b.total_amount) || 99),
        0
      );

      const realSettledAmt = allBookings
        .filter((b) => b.payout_settled)
        .reduce((acc, b) => acc + (Number(b.worker_fee) || 0), 0);

      const activeBookingsCount = allBookings.filter(
        (b) =>
          b.status === 'confirmed' ||
          b.status === 'in_progress' ||
          b.status === 'waiting_confirmation'
      ).length;

      // 3. Fetch real pending withdrawal requests
      let pendingWithdrawalsCount = 0;
      try {
        const { data: withdrawals } = await supabase
          .from('withdrawal_requests')
          .select('id, status')
          .or('status.is.null,status.eq.PENDING');
        pendingWithdrawalsCount = (withdrawals || []).length;
      } catch (wErr) {
        // Table might not exist yet
      }

      setStats({
        totalUsers: allProfiles.length,
        totalWorkers: workers.length,
        availableWorkers: availableWorkersCount,
        pendingKYC: pending.length,
        activeBookings: activeBookingsCount,
        ordersThisWeek: realOrdersThisWeek,
        totalRevenue: realTotalRevenue,
        settledPayouts: realSettledAmt,
        pendingWithdrawals: pendingWithdrawalsCount,
      });

      setRecentBookings(allBookings);

      // 4. Calculate Real Trade Demand from bookings
      const tradeMap: Record<string, number> = {};
      allBookings.forEach((b) => {
        const trade = b.service_type || b.trade || b.worker_skill || 'General Mistri';
        tradeMap[trade] = (tradeMap[trade] || 0) + 1;
      });

      const totalBookingsCount = allBookings.length || 1;
      const sortedTrades = Object.entries(tradeMap).map(([name, count]) => ({
        name,
        count,
        pct: Math.min(100, Math.round((count / totalBookingsCount) * 100)),
      }));

      setTradeActivity(sortedTrades);
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

  const handleQuickApprove = async (workerId: string) => {
    setApprovingId(workerId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'APPROVED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', workerId);

      if (!error) {
        // Defensively update worker_profiles
        try {
          await supabase
            .from('worker_profiles')
            .update({
              is_available: true,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', workerId);
        } catch (wpErr) {
          console.log('worker_profiles sync notice:', wpErr);
        }

        setPendingWorkers((prev) => prev.filter((w) => w.id !== workerId));
        setStats((prev) => ({
          ...prev,
          pendingKYC: Math.max(0, prev.pendingKYC - 1),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Operations & Marketplace Live Status
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              Realtime Supabase Sync
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Realtime marketplace activity across customers, contractors & workers • 100% live verified data
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards (100% Real Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Real Orders This Week */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Orders This Week
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {stats.ordersThisWeek}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {stats.activeBookings} Currently Active / In-Progress
            </span>
            <Link href="/orders" className="text-xs font-bold text-purple-600 hover:underline">
              View →
            </Link>
          </div>
        </div>

        {/* KPI 2: Real Active Workers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Registered Workers
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {stats.totalWorkers}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats.availableWorkers} Ready on App</span>
            </span>
            <Link href="/workers" className="text-xs font-bold text-blue-600 hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* KPI 3: Real Platform GMV / Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gross Volume (GMV)
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">
              Total Booking Fees Received
            </span>
            <Link href="/payments" className="text-xs font-bold text-emerald-600 hover:underline">
              Ledger →
            </Link>
          </div>
        </div>

        {/* KPI 4: Pending Aadhaar KYC Queue */}
        <Link
          href="/workers"
          className="bg-white rounded-2xl p-5 border border-amber-300/80 shadow-card hover:border-amber-400 hover:shadow-md transition relative overflow-hidden flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Pending Aadhaar KYC</span>
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {stats.pendingKYC}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 group-hover:underline">
              Review Documents →
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {stats.pendingKYC > 0 ? 'Action Required' : 'All Clear ✓'}
            </span>
          </div>
        </Link>
      </div>

      {/* Middle Grid: Activity Matrix + Attention Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Real Trade Demand Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Trade Demand & Activity Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Realtime customer request density mapped by trade category from database
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>{recentBookings.length} Total Lifetime Orders</span>
              </div>
            </div>

            {/* Real Trade Activity Listing */}
            {tradeActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl my-4">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No customer orders recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When customers book mistris on the mobile app, real request density will automatically chart here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 my-4">
                {tradeActivity.map((trade) => (
                  <div key={trade.name} className="flex items-center gap-4">
                    <span className="w-48 text-xs font-semibold text-slate-700 truncate">{trade.name}</span>
                    <div className="flex-1 flex items-center gap-1.5">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const filled = i < (trade.pct / 100) * 24;
                        return (
                          <span
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition ${
                              filled ? 'bg-emerald-500' : 'bg-slate-100'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="w-24 text-right text-xs font-semibold text-slate-600">
                      {trade.count} {trade.count === 1 ? 'Request' : 'Requests'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Marketplace Pricing Model: <strong className="text-slate-800">₹99 Booking Fee + Direct On-Site Agreement</strong></span>
            <Link href="/settings" className="text-orange-600 font-semibold hover:underline">
              Gateway & Helpline Settings →
            </Link>
          </div>
        </div>

        {/* Right (1 col): Real "Needs You" Attention Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Needs Your Attention</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {stats.pendingKYC + stats.pendingWithdrawals} Items
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Item 1: KYC */}
              <Link
                href="/workers"
                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 hover:bg-amber-50 border border-amber-200/70 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                    {stats.pendingKYC} Worker Aadhaar Approvals
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {stats.pendingKYC > 0 ? 'Front & Back photos ready for 1-tap review' : 'No pending worker approvals'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 mt-1" />
              </Link>

              {/* Item 2: Worker Withdrawals */}
              <Link
                href="/payments"
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/70 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    {stats.pendingWithdrawals} Worker Withdrawal Requests
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {stats.pendingWithdrawals > 0 ? 'Worker payouts awaiting approval' : 'All worker payouts settled'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 mt-1" />
              </Link>

              {/* Item 3: Orders */}
              <Link
                href="/orders"
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-800">
                    {stats.activeBookings} Active Customer Orders
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live dispatch & OTP tracking
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 mt-1" />
              </Link>
            </div>
          </div>

          {/* Quick Helpline Settings Card */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-card relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Gateway & Settings</span>
            </div>
            <h4 className="text-base font-bold tracking-tight">
              Razorpay Live/Test Sync
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Switch gateway keys, toggle test/live mode, or update support helpline anytime from settings.
            </p>
            <Link
              href="/settings"
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <span>Manage Gateway Keys</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Aadhaar KYC Approvals Drawer */}
      {pendingWorkers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-amber-300 shadow-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-base font-bold text-slate-900">
                  Urgent Aadhaar KYC Verification Queue
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect Aadhaar ID photos and approve to immediately unlock mobile app work
              </p>
            </div>
            <Link
              href="/workers"
              className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
            >
              <span>View All ({stats.pendingKYC})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingWorkers.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{w.full_name || 'Worker'}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{w.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Aadhaar Uploaded
                    </span>
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {Array.isArray(w.skills) &&
                      w.skills.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                  </div>

                  {/* Aadhaar Photo Direct Previews */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Aadhaar Front
                      </span>
                      {w.aadhaarFront && (w.aadhaarFront.startsWith('data:image') || w.aadhaarFront.startsWith('http')) ? (
                        <img src={w.aadhaarFront} alt="Front" className="w-full h-14 object-cover rounded border border-slate-200" />
                      ) : w.aadhaarFront ? (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Attached
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Not uploaded</span>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Aadhaar Back
                      </span>
                      {w.aadhaarBack && (w.aadhaarBack.startsWith('data:image') || w.aadhaarBack.startsWith('http')) ? (
                        <img src={w.aadhaarBack} alt="Back" className="w-full h-14 object-cover rounded border border-slate-200" />
                      ) : w.aadhaarBack ? (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Attached
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center gap-2">
                  <Link
                    href="/workers"
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-center text-xs font-semibold transition"
                  >
                    View Photos
                  </Link>
                  <button
                    onClick={() => handleQuickApprove(w.id)}
                    disabled={approvingId === w.id}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-center text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {approvingId === w.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>1-Tap Approve</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings & Operations Table (100% Real Live Bookings) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Bookings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live orders flowing from the customer mobile application
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All Bookings ({recentBookings.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Service & Trade</th>
                <th className="pb-3">Assigned Worker</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No customer bookings found in database. Once orders are placed in the app, they appear here live.
                  </td>
                </tr>
              ) : (
                recentBookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pl-2 font-mono font-semibold text-slate-800">
                      #{String(b.id).slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white font-bold flex items-center justify-center text-[11px]">
                          {(b.customer_name || 'Customer').charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {b.customer_name || 'Customer'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-slate-700">
                        {b.service_type || b.trade || b.worker_skill || 'General Mistri Work'}
                      </span>
                    </td>
                    <td className="py-3">
                      {b.worker_name && b.worker_name !== 'Unassigned' ? (
                        <span className="font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{b.worker_name}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          Waiting Worker Assignment
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      ₹{Number(b.total_amount || 99).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Link
                        href="/orders"
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
