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
  ArrowDownLeft,
  User,
  Phone,
  Banknote,
  Send,
} from 'lucide-react';

export default function PaymentsPage() {
  const [section, setSection] = useState<'orders' | 'withdrawals'>('orders');
  const [bookings, setBookings] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');
  const [search, setSearch] = useState('');
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // 1. Fetch bookings
      const { data: bData, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bErr) throw bErr;
      setBookings(bData || []);

      // 2. Fetch withdrawal requests defensively
      try {
        const { data: wData } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .order('created_at', { ascending: false });
        setWithdrawals(wData || []);
      } catch (wErr) {
        console.log('Withdrawal requests table notice:', wErr);
      }
    } catch (err: any) {
      console.log('Error fetching payments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalGross = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 99), 0);
  const totalPlatformFees = bookings.reduce(
    (sum, b) => sum + (Number(b.platform_fee) || 99),
    0
  );
  const settledTotal = bookings
    .filter((b) => b.payout_settled)
    .reduce((sum, b) => sum + (Number(b.worker_fee) || 0), 0);
  const pendingTotal = bookings
    .filter((b) => !b.payout_settled && b.status !== 'cancelled')
    .reduce((sum, b) => sum + (Number(b.worker_fee) || 99), 0);

  const pendingWithdrawalsCount = withdrawals.filter(
    (w) => !w.status || w.status === 'PENDING'
  ).length;

  const filteredBookings = bookings.filter((b) => {
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
      b.id.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (w.worker_name || '').toLowerCase().includes(q) ||
      (w.worker_phone || '').toLowerCase().includes(q) ||
      (w.payout_method || '').toLowerCase().includes(q) ||
      (w.payout_details || '').toLowerCase().includes(q) ||
      String(w.amount || '').includes(q);

    return matchesSearch;
  });

  // 1-Tap Settle Payout to Worker
  const handleSettlePayout = async (bookingId: string) => {
    setSettlingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          payout_settled: true,
          payout_settled_at: new Date().toISOString(),
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, payout_settled: true } : b))
      );
    } catch (err: any) {
      alert(`Settlement failed: ${err.message}`);
    } finally {
      setSettlingId(null);
    }
  };

  // Approve & Process Worker Withdrawal
  const handleApproveWithdrawal = async (reqId: string) => {
    setProcessingWithdrawalId(reqId);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'PROCESSED',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reqId);

      if (error) throw error;

      setWithdrawals((prev) =>
        prev.map((w) => (w.id === reqId ? { ...w, status: 'PROCESSED' } : w))
      );
      alert('Withdrawal marked as successfully PROCESSED & paid out!');
    } catch (err: any) {
      alert(`Withdrawal approval failed: ${err.message}`);
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  // Reject Worker Withdrawal
  const handleRejectWithdrawal = async (reqId: string) => {
    const reason = prompt('Please enter reason for rejection:') || 'Details verification failed.';
    setProcessingWithdrawalId(reqId);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'REJECTED',
          rejection_reason: reason,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reqId);

      if (error) throw error;

      setWithdrawals((prev) =>
        prev.map((w) => (w.id === reqId ? { ...w, status: 'REJECTED' } : w))
      );
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Financial Ledger & Payout Settlement</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realtime Razorpay order reconciliation, booking fees, on-site quotation model, and worker withdrawal authorization.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Reload Ledger</span>
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gross Bookings Total
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>₹99 / ₹599 Booking Collections</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Platform Margins
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ₹{totalPlatformFees.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct Platform Booking Fees</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settled to Workers
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            ₹{settledTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Completed Bank Transfers</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-300 shadow-card bg-amber-50/20">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Pending Worker Withdrawals
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {pendingWithdrawalsCount} Requests
          </div>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">
            Minimum ₹100 • Awaiting Admin Action
          </p>
        </div>
      </div>

      {/* Top Section Selector (Orders vs Worker Withdrawals) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSection('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            section === 'orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Customer Booking Charges ({bookings.length})</span>
        </button>

        <button
          onClick={() => setSection('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            section === 'withdrawals'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>Worker Withdrawal Requests</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: CUSTOMER BOOKING CHARGES */}
      {section === 'orders' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(
                [
                  { key: 'ALL', label: 'All Transactions' },
                  { key: 'PENDING', label: 'Awaiting Settlement' },
                  { key: 'SETTLED', label: 'Settled & Paid' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Razorpay ID, worker..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Payment ID & Date</th>
                    <th className="px-6 py-3.5">Customer & Job</th>
                    <th className="px-6 py-3.5">Assigned Worker</th>
                    <th className="px-6 py-3.5">Booking Fee</th>
                    <th className="px-6 py-3.5">Job Quote Model</th>
                    <th className="px-6 py-3.5">Settlement Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading transactions...</span>
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const gross = Number(b.total_amount) || 99;
                      const isSettled = Boolean(b.payout_settled);

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                          {/* Payment ID & Date */}
                          <td className="px-6 py-3.5">
                            <p className="font-mono font-bold text-slate-900">
                              {b.razorpay_payment_id || `PAY_${b.id.slice(0, 8)}`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(b.created_at).toLocaleDateString()}
                            </p>
                          </td>

                          {/* Customer & Job */}
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-900">{b.customer_name || 'Customer'}</p>
                            <p className="text-[11px] text-slate-500">{b.service_type || 'Mistri Service'}</p>
                          </td>

                          {/* Worker */}
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-800">{b.worker_name || 'Pending Worker'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{b.worker_phone || ''}</p>
                          </td>

                          {/* Gross Paid */}
                          <td className="px-6 py-3.5 font-bold text-slate-900">
                            ₹{gross.toLocaleString('en-IN')}
                          </td>

                          {/* Direct Quote Model */}
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              Quote Agreed On-Site
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-3.5">
                            {isSettled ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                SETTLED ✓
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                PENDING RELEASE
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-3.5 text-right">
                            {!isSettled ? (
                              <button
                                onClick={() => handleSettlePayout(b.id)}
                                disabled={settlingId === b.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                              >
                                {settlingId === b.id ? 'Settling...' : 'Release Payout'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Completed</span>
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
      )}

      {/* SECTION 2: WORKER WITHDRAWAL REQUESTS */}
      {section === 'withdrawals' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Worker Direct Withdrawals</h3>
              <p className="text-xs text-slate-500">
                Workers withdraw earnings directly to UPI or Bank Accounts (Minimum ₹100).
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search worker, phone, UPI..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Request ID & Date</th>
                    <th className="px-6 py-3.5">Worker Name</th>
                    <th className="px-6 py-3.5">Contact Phone</th>
                    <th className="px-6 py-3.5">Withdrawal Amount</th>
                    <th className="px-6 py-3.5">Payout Method & Details</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading withdrawal requests...</span>
                      </td>
                    </tr>
                  ) : filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No worker withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.map((w) => {
                      const isPending = !w.status || w.status === 'PENDING';
                      const isProcessed = w.status === 'PROCESSED';
                      const isRejected = w.status === 'REJECTED';

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-3.5">
                            <p className="font-mono font-bold text-slate-900">
                              #{String(w.id).slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {w.created_at ? new Date(w.created_at).toLocaleDateString() : 'Today'}
                            </p>
                          </td>

                          <td className="px-6 py-3.5 font-bold text-slate-900">
                            {w.worker_name || 'Worker'}
                          </td>

                          <td className="px-6 py-3.5 font-mono text-slate-700">
                            {w.worker_phone || '—'}
                          </td>

                          <td className="px-6 py-3.5 font-extrabold text-base text-slate-900">
                            ₹{Number(w.amount || 0).toLocaleString('en-IN')}
                          </td>

                          <td className="px-6 py-3.5">
                            <span className="font-bold text-slate-800 uppercase text-[11px]">
                              {w.payout_method || 'UPI'}
                            </span>
                            <p className="font-mono text-slate-600 text-[11px] truncate max-w-[180px]">
                              {w.payout_details || '—'}
                            </p>
                          </td>

                          <td className="px-6 py-3.5">
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                                PENDING REVIEW
                              </span>
                            )}
                            {isProcessed && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                PROCESSED ✓
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                REJECTED ✕
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-3.5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApproveWithdrawal(w.id)}
                                  disabled={processingWithdrawalId === w.id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                  {processingWithdrawalId === w.id ? 'Processing...' : 'Approve & Pay'}
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(w.id)}
                                  disabled={processingWithdrawalId === w.id}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Closed</span>
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
      )}
    </div>
  );
}
