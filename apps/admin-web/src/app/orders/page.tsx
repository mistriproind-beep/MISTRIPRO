'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Briefcase,
  Search,
  Filter,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  IndianRupee,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export default function OrdersPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assigningBooking, setAssigningBooking] = useState<any | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch bookings and verified workers
  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      const { data: bData, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bErr) throw bErr;
      setBookings(bData || []);

      // Fetch workers for assignment dropdown
      const { data: wProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, kyc_status')
        .eq('role', 'WORKER');

      const { data: wpData } = await supabase.from('worker_profiles').select('*');

      const mergedW = (wProfiles || []).map((p) => {
        const wp = (wpData || []).find((item) => item.user_id === p.id) || {};
        return {
          id: p.id,
          name: p.full_name,
          phone: p.phone,
          skills: wp.skills || ['General Mistri'],
          dailyRate: wp.daily_rate || 800,
          isAvailable: wp.is_available ?? true,
        };
      });

      setWorkers(mergedW);
    } catch (err: any) {
      console.log('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'WAITING'
        ? b.status === 'waiting_confirmation' || !b.worker_name
        : b.status === statusFilter;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.worker_name || '').toLowerCase().includes(q) ||
      (b.id || '').toLowerCase().includes(q) ||
      (b.site_location || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Assign Worker to Booking
  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedWorkerId) return;
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    setActionLoading(true);
    try {
      const updates = {
        worker_id: worker.id,
        worker_name: worker.name,
        worker_phone: worker.phone,
        status: 'confirmed',
        progress_step: 2, // Step 2: Worker Assigned & En Route
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', assigningBooking.id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === assigningBooking.id ? { ...b, ...updates } : b))
      );

      setAssigningBooking(null);
      setSelectedWorkerId('');
      alert(`Worker "${worker.name}" assigned successfully to order #${assigningBooking.id.slice(0, 8)}! Live synced with customer app.`);
    } catch (err: any) {
      alert(`Error assigning worker: ${err?.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Booking Progress Step Override
  const handleUpdateStep = async (bookingId: string, newStep: number) => {
    try {
      const statusMap: Record<number, string> = {
        1: 'waiting_confirmation',
        2: 'confirmed',
        3: 'in_progress',
        4: 'completed',
      };

      const updates = {
        progress_step: newStep,
        status: statusMap[newStep] || 'confirmed',
        updated_at: new Date().toISOString(),
      };

      await supabase.from('bookings').update(updates).eq('id', bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)));
    } catch (err: any) {
      alert(`Error updating step: ${err?.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Order & Booking Operations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
              {bookings.length} Total Orders
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch workers to unassigned customer requests, track job progression, and resolve site milestones.
          </p>
        </div>

        <button
          onClick={fetchOrdersData}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Reload Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'ALL', label: `All Orders (${bookings.length})` },
              { key: 'WAITING', label: 'Unassigned / Waiting' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
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
            placeholder="Search orders, customers, workers..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Loading customer bookings from Supabase...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No orders found</p>
            <p className="text-xs text-slate-500 mt-1">Check back once customer orders are placed in the mobile app.</p>
          </div>
        ) : (
          filteredBookings.map((order) => {
            const isUnassigned = !order.worker_name || order.status === 'waiting_confirmation';
            const currentStep = order.progress_step || 1;

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl hover:border-slate-700 transition space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 font-bold border border-amber-400/20">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {order.title || order.category || 'General Construction Service'}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{order.site_location || 'Jaipur Region, Rajasthan'}</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">₹{order.total_amount || 997}</span>
                      <p className="text-[11px] text-slate-500">Paid via {order.payment_method || 'Razorpay'}</p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                        isUnassigned
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 animate-pulse'
                          : order.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {isUnassigned ? 'Unassigned' : order.status}
                    </span>
                  </div>
                </div>

                {/* Customer & Worker Attribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer Card */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Customer</p>
                    <p className="font-bold text-white text-sm">{order.customer_name || 'Customer'}</p>
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.customer_phone || '+91 98290 12345'}</span>
                    </div>
                  </div>

                  {/* Worker Card / Assign Button */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Assigned Worker</p>
                    {isUnassigned ? (
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-amber-400 font-semibold">No Worker Assigned Yet</span>
                        <button
                          onClick={() => {
                            setAssigningBooking(order);
                            setSelectedWorkerId('');
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Worker</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{order.worker_name}</p>
                          <div className="flex items-center gap-1.5 font-mono text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{order.worker_phone || 'N/A'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setAssigningBooking(order);
                            setSelectedWorkerId('');
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline"
                        >
                          Reassign
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Step Live Tracker */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Job Progression (Synced with Mobile App)
                    </span>
                    <span className="text-xs font-mono text-amber-400">Step {currentStep} of 4</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { step: 1, label: '1. Request Sent' },
                      { step: 2, label: '2. Worker Assigned' },
                      { step: 3, label: '3. Work Started' },
                      { step: 4, label: '4. Completed' },
                    ].map((item) => {
                      const isPast = currentStep >= item.step;
                      const isCurrent = currentStep === item.step;

                      return (
                        <button
                          key={item.step}
                          onClick={() => handleUpdateStep(order.id, item.step)}
                          className={`p-2 rounded-xl text-center text-xs font-bold transition border cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                              : isPast
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-950/40 text-slate-500 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Worker Assignment Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Assign Verified Worker</span>
              </h3>
              <button
                onClick={() => setAssigningBooking(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select a verified mistri from the registered database to assign to order #
              <span className="font-mono text-white">{assigningBooking.id.slice(0, 8)}</span>:
            </p>

            <form onSubmit={handleAssignWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Mistri</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="">-- Choose a Verified Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({Array.isArray(w.skills) ? w.skills.join(', ') : w.skills}) - ₹{w.dailyRate}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedWorkerId}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
