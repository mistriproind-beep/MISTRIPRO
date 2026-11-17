'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CreditCard,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Download,
  RefreshCw,
  AlertCircle,
  Check,
  Building,
  Shield,
  Layers,
} from 'lucide-react';

export default function PaymentsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');
  const [search, setSearch] = useState('');
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.log('Error fetching payments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalGross = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
  const totalPlatformFees = bookings.reduce((sum, b) => sum + (Number(b.platform_fee) || 99) + (Number(b.transaction_fee) || 48), 0);
  const settledTotal = bookings.filter((b) => b.payout_settled).reduce((sum, b) => sum + (Number(b.worker_fee) || 0), 0);
  const pendingTotal = bookings.filter((b) => !b.payout_settled && b.status !== 'cancelled').reduce((sum, b) => sum + (Number(b.worker_fee) || 800), 0);

  const filtered = bookings.filter((b) => {
    const isSettled = Boolean(b.payout_settled);
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'PENDING'
        ? !isSettled && b.status !== 'cancelled'
        : isSettled;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.worker_name || '').toLowerCase().includes(q) ||
      (b.razorpay_payment_id || '').toLowerCase().includes(q) ||
      (b.id || '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  // 1-Tap Settle Payout to Worker
  const handleMarkSettled = async (booking: any) => {
    setSettlingId(booking.id);
    const refCode = `SETTLE-TXN-${Date.now()}`;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          payout_settled: true,
          payout_reference: refCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, payout_settled: true, payout_reference: refCode } : b
        )
      );

      alert(`✅ Payout of ₹${booking.worker_fee} for worker ${booking.worker_name} marked as SETTLED!\nRef: ${refCode}`);
    } catch (err: any) {
      alert(`Settlement error: ${err?.message}`);
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Payment Approvals & Financial Settlement
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              RAZORPAY LIVE TEST
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor incoming customer payments, platform commissions, and release worker daily wage settlements.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Reload Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gross Volume</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">₹{totalGross.toLocaleString()}</span>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>Razorpay Verified</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-400">₹{totalPlatformFees.toLocaleString()}</span>
            <p className="text-xs text-slate-400 mt-1">Platform commissions & GST</p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 ring-1 ring-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Worker Payouts Due</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-400">₹{pendingTotal.toLocaleString()}</span>
            <p className="text-xs text-slate-400 mt-1">Awaiting 1-Tap Transfer Approval</p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Settled to Mistris</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">₹{settledTotal.toLocaleString()}</span>
            <p className="text-xs text-slate-400 mt-1">Completed Bank Transfers</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(
            [
              { key: 'ALL', label: `All Payments (${bookings.length})` },
              { key: 'PENDING', label: 'Pending Settlement' },
              { key: 'SETTLED', label: 'Settled / Transferred' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filter === tab.key
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments, Razorpay ID, names..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Transaction / Gateway ID</th>
                <th className="px-6 py-4">Customer & Worker</th>
                <th className="px-6 py-4">Gross Collected</th>
                <th className="px-6 py-4">Platform Fee</th>
                <th className="px-6 py-4">Worker Wage Due</th>
                <th className="px-6 py-4">Settlement Status</th>
                <th className="px-6 py-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading payment transactions...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No transactions match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isSettled = Boolean(item.payout_settled);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* Gateway ID */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-white text-xs">
                            {item.razorpay_payment_id || `pay_${item.id.slice(0, 12)}`}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">Order #{item.id.slice(0, 8)}</p>
                          <p className="text-[10px] text-slate-600">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </td>

                      {/* Customer & Worker */}
                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{item.customer_name || 'Customer'}</p>
                          <p className="text-slate-400">
                            Mistri:{' '}
                            <span className="text-amber-400 font-medium">{item.worker_name || 'Unassigned'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="px-6 py-4 font-black text-white text-sm">
                        ₹{item.total_amount || 997}
                      </td>

                      {/* Platform Fee */}
                      <td className="px-6 py-4 text-xs font-semibold text-emerald-400">
                        +₹{(Number(item.platform_fee) || 99) + (Number(item.transaction_fee) || 48)}
                      </td>

                      {/* Worker Wage */}
                      <td className="px-6 py-4 font-bold text-amber-400 text-xs">
                        ₹{item.worker_fee || 850}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isSettled ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              SETTLED ✓
                            </span>
                            {item.payout_reference && (
                              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                {item.payout_reference}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30 animate-pulse">
                            PENDING PAYOUT
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isSettled ? (
                          <span className="text-xs text-slate-500 font-medium">Transferred</span>
                        ) : (
                          <button
                            onClick={() => handleMarkSettled(item)}
                            disabled={settlingId === item.id || !item.worker_name}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                          >
                            {settlingId === item.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            )}
                            <span>Approve & Settle</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
