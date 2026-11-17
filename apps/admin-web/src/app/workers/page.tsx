'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Maximize2,
  HardHat,
  Briefcase,
  IndianRupee,
} from 'lucide-react';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Fetch workers from Supabase profiles + worker_profiles
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'WORKER')
        .order('created_at', { ascending: false });

      if (pErr) throw pErr;

      const { data: workerProfiles, error: wpErr } = await supabase
        .from('worker_profiles')
        .select('*');

      if (wpErr) throw wpErr;

      // Merge data
      const merged = (profiles || []).map((p) => {
        const wp = (workerProfiles || []).find((item) => item.user_id === p.id) || {};
        return {
          id: p.id,
          workerProfileId: wp.id,
          name: p.full_name || 'Verified Mistri',
          phone: p.phone || '',
          altPhone: p.alt_phone || '',
          address: p.address || 'Jaipur Region, Rajasthan',
          city: p.city || 'Sawai Madhopur',
          kycStatus: p.kyc_status || 'PENDING',
          createdAt: p.created_at,
          skills: wp.skills || ['General Labour'],
          experienceYears: wp.experience_years || 5,
          dailyRate: wp.daily_rate || 800,
          aadhaarFront: wp.aadhaar_front_url || null,
          aadhaarBack: wp.aadhaar_back_url || null,
          rating: wp.rating || 5.0,
          isAvailable: wp.is_available ?? true,
        };
      });

      setWorkers(merged);

      // If an ID was in URL query, select it
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('id');
      if (targetId) {
        const found = merged.find((w) => w.id === targetId);
        if (found) setSelectedWorker(found);
      }
    } catch (err: any) {
      console.log('Error fetching workers:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Filter and search
  const filteredWorkers = workers.filter((w) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'PENDING'
        ? w.kycStatus === 'PENDING' || w.kycStatus === 'UNDER_REVIEW'
        : w.kycStatus === filter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      w.name.toLowerCase().includes(query) ||
      w.phone.includes(query) ||
      (Array.isArray(w.skills) && w.skills.some((s: string) => s.toLowerCase().includes(query))) ||
      w.address.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = workers.filter(
    (w) => w.kycStatus === 'PENDING' || w.kycStatus === 'UNDER_REVIEW'
  ).length;

  // Approve Worker Handler
  const handleApprove = async (worker: any) => {
    setActionLoading(true);
    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'APPROVED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', worker.id);

      if (pErr) throw pErr;

      const { error: wpErr } = await supabase
        .from('worker_profiles')
        .update({
          is_available: true,
        })
        .eq('user_id', worker.id);

      if (wpErr) throw wpErr;

      setWorkers((prev) =>
        prev.map((w) => (w.id === worker.id ? { ...w, kycStatus: 'APPROVED' } : w))
      );

      if (selectedWorker?.id === worker.id) {
        setSelectedWorker((prev: any) => ({ ...prev, kycStatus: 'APPROVED' }));
      }

      alert(`✅ Worker "${worker.name}" has been officially APPROVED! Their mobile app is now unlocked.`);
    } catch (err: any) {
      alert(`Approval error: ${err?.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Worker Handler
  const handleReject = async () => {
    if (!selectedWorker) return;
    setActionLoading(true);
    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'REJECTED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedWorker.id);

      if (pErr) throw pErr;

      setWorkers((prev) =>
        prev.map((w) => (w.id === selectedWorker.id ? { ...w, kycStatus: 'REJECTED' } : w))
      );

      setSelectedWorker((prev: any) => ({ ...prev, kycStatus: 'REJECTED' }));
      setShowRejectModal(false);
      setRejectReason('');
      alert(`Worker "${selectedWorker.name}" marked as REJECTED.`);
    } catch (err: any) {
      alert(`Reject error: ${err?.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Worker KYC & Identity Approvals
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30">
              {pendingCount} Pending Review
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review government Aadhaar card photos, trade skills, and verify mistris for live app booking.
          </p>
        </div>

        <button
          onClick={fetchWorkers}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Reload Workers</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'PENDING', label: `Pending Review (${pendingCount})` },
              { key: 'APPROVED', label: 'Approved' },
              { key: 'REJECTED', label: 'Rejected' },
              { key: 'ALL', label: 'All Workers' },
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

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, skill..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Main Content Layout: Worker List + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workers List Column */}
        <div className={`space-y-3 ${selectedWorker ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium">Fetching verified worker registry...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No workers match this filter</p>
              <p className="text-xs text-slate-500 mt-1">Try switching tabs or clearing your search query.</p>
            </div>
          ) : (
            filteredWorkers.map((worker) => {
              const isSelected = selectedWorker?.id === worker.id;
              const hasAadhaar = Boolean(worker.aadhaarFront && worker.aadhaarBack);

              return (
                <div
                  key={worker.id}
                  onClick={() => setSelectedWorker(worker)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400/80 ring-1 ring-amber-400/40 shadow-xl'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow">
                        {worker.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{worker.name}</h3>
                          {worker.kycStatus === 'APPROVED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              APPROVED ✓
                            </span>
                          )}
                          {(worker.kycStatus === 'PENDING' || worker.kycStatus === 'UNDER_REVIEW') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30 animate-pulse">
                              PENDING REVIEW
                            </span>
                          )}
                          {worker.kycStatus === 'REJECTED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                              REJECTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                          {Array.isArray(worker.skills) ? worker.skills.join(', ') : worker.skills}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white">₹{worker.dailyRate}</span>
                      <span className="text-[11px] text-slate-400">/day</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-slate-300">{worker.phone || 'No phone'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasAadhaar ? (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Aadhaar Both Sides ✓</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Missing Aadhaar</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Worker Detailed KYC Review Drawer */}
        {selectedWorker && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
                {selectedWorker.name?.charAt(0) || 'W'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-extrabold text-white">{selectedWorker.name}</h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      selectedWorker.kycStatus === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedWorker.kycStatus === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    }`}
                  >
                    {selectedWorker.kycStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedWorker.address}</span>
                  <span>•</span>
                  <span>Registered: {new Date(selectedWorker.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Primary Trade</p>
                <p className="text-sm font-extrabold text-amber-400 mt-0.5">
                  {Array.isArray(selectedWorker.skills) ? selectedWorker.skills[0] : selectedWorker.skills}
                </p>
              </div>
              <div className="border-x border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Experience</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{selectedWorker.experienceYears} Years</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Daily Rate</p>
                <p className="text-sm font-extrabold text-white mt-0.5">₹{selectedWorker.dailyRate}/day</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${selectedWorker.phone}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Primary: {selectedWorker.phone}</span>
              </a>
              {selectedWorker.altPhone ? (
                <a
                  href={`tel:${selectedWorker.altPhone}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>Alt Phone: {selectedWorker.altPhone}</span>
                </a>
              ) : null}
            </div>

            {/* ======================================================== */}
            {/* AADHAAR CARD VERIFICATION PHOTOS (FRONT & BACK) */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Government ID Document (Aadhaar Card)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Click photo to zoom / inspect</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aadhaar Front */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Aadhaar Card Front</span>
                    {selectedWorker.aadhaarFront ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        Missing ⚠️
                      </span>
                    )}
                  </div>

                  <div className="aspect-[16/10] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center relative group">
                    {selectedWorker.aadhaarFront ? (
                      <>
                        <img
                          src={selectedWorker.aadhaarFront}
                          alt="Aadhaar Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <button
                          onClick={() => setPreviewImage(selectedWorker.aadhaarFront)}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs"
                        >
                          <Maximize2 className="w-5 h-5 text-amber-400" />
                          <span>Inspect Full Size</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 text-slate-600">
                        <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        <p className="text-xs">No Front Photo Provided</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Aadhaar Card Back</span>
                    {selectedWorker.aadhaarBack ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        Missing ⚠️
                      </span>
                    )}
                  </div>

                  <div className="aspect-[16/10] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center relative group">
                    {selectedWorker.aadhaarBack ? (
                      <>
                        <img
                          src={selectedWorker.aadhaarBack}
                          alt="Aadhaar Back"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <button
                          onClick={() => setPreviewImage(selectedWorker.aadhaarBack)}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs"
                        >
                          <Maximize2 className="w-5 h-5 text-amber-400" />
                          <span>Inspect Full Size</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 text-slate-600">
                        <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        <p className="text-xs">No Back Photo Provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Decision Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => handleApprove(selectedWorker)}
                disabled={actionLoading || selectedWorker.kycStatus === 'APPROVED'}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-5 h-5" strokeWidth={3} />
                )}
                <span>Approve Worker Profile (1-Tap Unlock)</span>
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading || selectedWorker.kycStatus === 'REJECTED'}
                className="py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-sm transition border border-rose-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="Document Preview" className="max-w-full max-h-[82vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Worker Application</span>
            </h3>
            <p className="text-xs text-slate-400">
              Please specify the rejection reason (e.g. Unclear Aadhaar photo, invalid phone, incomplete details):
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Aadhaar card details are blurry. Please re-upload clearer photos..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
