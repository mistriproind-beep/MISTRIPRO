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
          isAvailable: wp.is_available ?? true,
          kycStatus: p.kyc_status,
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
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      b.id.toLowerCase().includes(q) ||
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.worker_name || '').toLowerCase().includes(q) ||
      (b.service_type || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  // Assign worker
  const handleAssignWorker = async () => {
    if (!assigningBooking || !selectedWorkerId) return;
    setActionLoading(true);

    try {
      const worker = workers.find((w) => w.id === selectedWorkerId);
      const updates = {
        worker_id: selectedWorkerId,
        worker_name: worker?.name || 'Assigned Worker',
        worker_phone: worker?.phone || '',
        status: 'confirmed',
        current_step: 2, // Step 2: Worker Assigned & En Route
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
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Step Status Override
  const handleStepOverride = async (bookingId: string, newStep: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          current_step: newStep,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (!error) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, current_step: newStep, status: newStatus } : b
          )
        );
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Orders & Dispatch Control</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              {bookings.length} Total Bookings
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch workers to customer requests, override step statuses, and track live job progress.
          </p>
        </div>

        <button
          onClick={fetchOrdersData}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Reload Bookings</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(
            [
              { key: 'ALL', label: 'All Orders' },
              { key: 'pending', label: 'Waiting Assignment' },
              { key: 'confirmed', label: 'Assigned' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.key
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
            placeholder="Search by customer, mistri, trade..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order ID & Date</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Trade & Task</th>
                <th className="px-6 py-3.5">Assigned Mistri</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Job Step Tracker</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading active bookings...</span>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    {/* ID & Date */}
                    <td className="px-6 py-3.5">
                      <p className="font-mono font-bold text-slate-900">
                        #{b.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(b.created_at).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900">{b.customer_name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{b.customer_phone || ''}</p>
                    </td>

                    {/* Trade & Task */}
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-800">
                        {b.service_type || b.trade || 'General Work'}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{b.address || 'On-site'}</span>
                      </div>
                    </td>

                    {/* Assigned Worker */}
                    <td className="px-6 py-3.5">
                      {b.worker_name && b.worker_name !== 'Unassigned' ? (
                        <div>
                          <p className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{b.worker_name}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{b.worker_phone}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningBooking(b)}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-bold text-[11px] hover:bg-orange-100 transition flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3 text-orange-600" />
                          <span>Assign Mistri</span>
                        </button>
                      )}
                    </td>

                    {/* Amount & Direct Quote Model */}
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{Number(b.total_amount || 99).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        Booking Fee (Quote On-Site)
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {b.arrival_otp && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200" title="Arrival Verification OTP">
                            Arr: {b.arrival_otp}
                          </span>
                        )}
                        {b.completion_otp && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200" title="Completion Verification OTP">
                            Comp: {b.completion_otp}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Job Step Tracker Override */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        {[
                          { step: 1, label: 'Requested', status: 'pending' },
                          { step: 2, label: 'Assigned', status: 'confirmed' },
                          { step: 3, label: 'Working', status: 'in_progress' },
                          { step: 4, label: 'Done', status: 'completed' },
                        ].map((s) => (
                          <button
                            key={s.step}
                            onClick={() => handleStepOverride(b.id, s.step, s.status)}
                            title={`Click to set Step ${s.step}: ${s.label}`}
                            className={`w-6 h-6 rounded-md text-[10px] font-bold transition flex items-center justify-center ${
                              (b.current_step || 1) >= s.step
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {s.step}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {b.status || 'pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setAssigningBooking(b)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Worker Assignment Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-600" />
                <span>Assign Worker to Order</span>
              </h3>
              <button
                onClick={() => setAssigningBooking(null)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">Order ID:</p>
              <p className="text-sm font-mono font-bold text-slate-900">
                #{assigningBooking.id}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Customer: <strong>{assigningBooking.customer_name}</strong> •{' '}
                {assigningBooking.service_type}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Approved Mistri
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="">-- Choose from Verified Registry --</option>
                {workers
                  .filter((w) => w.kycStatus === 'APPROVED')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({Array.isArray(w.skills) ? w.skills.join(', ') : w.skills}) - {w.phone}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignWorker}
                disabled={!selectedWorkerId || actionLoading}
                className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
