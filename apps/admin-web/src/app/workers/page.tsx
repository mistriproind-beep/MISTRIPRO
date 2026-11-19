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
  ZoomIn,
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

    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.includes(searchQuery) ||
      (Array.isArray(w.skills) &&
        w.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesFilter && matchesSearch;
  });

  const pendingCount = workers.filter(
    (w) => w.kycStatus === 'PENDING' || w.kycStatus === 'UNDER_REVIEW'
  ).length;

  // Handle Approve
  const handleApprove = async (workerId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'APPROVED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', workerId);

      if (error) throw error;

      // Defensively sync worker_profiles availability
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

      // Update local state
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === workerId ? { ...w, kycStatus: 'APPROVED' } : w
        )
      );
      if (selectedWorker?.id === workerId) {
        setSelectedWorker((prev: any) => ({ ...prev, kycStatus: 'APPROVED' }));
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!selectedWorker) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'REJECTED',
          rejection_reason: rejectReason || 'Document verification could not be completed.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedWorker.id);

      if (error) throw error;

      setWorkers((prev) =>
        prev.map((w) =>
          w.id === selectedWorker.id ? { ...w, kycStatus: 'REJECTED' } : w
        )
      );
      setSelectedWorker((prev: any) => ({ ...prev, kycStatus: 'REJECTED' }));
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Worker Approvals & Aadhaar Verification</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold">
              {pendingCount} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted Aadhaar card photos, trade certifications, and approve workers for instant mobile app activation.
          </p>
        </div>

        <button
          onClick={fetchWorkers}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Reload Workers</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(
            [
              { key: 'PENDING', label: `Pending (${pendingCount})` },
              { key: 'APPROVED', label: 'Approved' },
              { key: 'REJECTED', label: 'Rejected' },
              { key: 'ALL', label: 'All Workers' },
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

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, trade..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
          />
        </div>
      </div>

      {/* Main Grid: Worker List + Selected Worker Aadhaar Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worker Cards Column */}
        <div className={`space-y-3 ${selectedWorker ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium">Fetching verified worker registry...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No workers match this filter</p>
              <p className="text-xs text-slate-400 mt-1">Try switching tabs or clearing your search query.</p>
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
                      ? 'bg-orange-50/40 border-orange-400 ring-1 ring-orange-300 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {worker.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{worker.name}</h3>
                          {worker.kycStatus === 'APPROVED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              APPROVED ✓
                            </span>
                          )}
                          {(worker.kycStatus === 'PENDING' || worker.kycStatus === 'UNDER_REVIEW') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold animate-pulse">
                              PENDING
                            </span>
                          )}
                          {worker.kycStatus === 'REJECTED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                              REJECTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {Array.isArray(worker.skills) ? worker.skills.join(', ') : worker.skills}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        Direct On-Site Quote
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-700">{worker.phone || 'No phone'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasAadhaar ? (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Aadhaar Both Sides ✓</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
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
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card relative space-y-6">
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {selectedWorker.name?.charAt(0) || 'W'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900">{selectedWorker.name}</h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      selectedWorker.kycStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedWorker.kycStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {selectedWorker.kycStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedWorker.address}</span>
                  <span>•</span>
                  <span>Registered: {new Date(selectedWorker.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Trade</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {Array.isArray(selectedWorker.skills) ? selectedWorker.skills[0] : selectedWorker.skills}
                </p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedWorker.experienceYears} Years</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Rate Model</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">On-Site Agreement</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${selectedWorker.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Primary: {selectedWorker.phone}</span>
              </a>
              {selectedWorker.altPhone && (
                <a
                  href={`tel:${selectedWorker.altPhone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Alt Phone: {selectedWorker.altPhone}</span>
                </a>
              )}
            </div>

            {/* ======================================================== */}
            {/* AADHAAR CARD VERIFICATION PHOTOS (FRONT & BACK) */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Government ID Document (Aadhaar Card)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Click photo to zoom / inspect</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aadhaar Front */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Aadhaar Card Front</span>
                    {selectedWorker.aadhaarFront ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                        Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-bold">
                        Missing
                      </span>
                    )}
                  </div>

                  <div className="aspect-[16/10] bg-slate-200 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative group">
                    {selectedWorker.aadhaarFront ? (
                      <>
                        <img
                          src={selectedWorker.aadhaarFront}
                          alt="Aadhaar Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <button
                          onClick={() => setPreviewImage(selectedWorker.aadhaarFront)}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs"
                        >
                          <Maximize2 className="w-4 h-4" />
                          <span>Inspect Full Size</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <FileText className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px]">No Front Photo Provided</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Aadhaar Card Back</span>
                    {selectedWorker.aadhaarBack ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                        Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-bold">
                        Missing
                      </span>
                    )}
                  </div>

                  <div className="aspect-[16/10] bg-slate-200 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative group">
                    {selectedWorker.aadhaarBack ? (
                      <>
                        <img
                          src={selectedWorker.aadhaarBack}
                          alt="Aadhaar Back"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <button
                          onClick={() => setPreviewImage(selectedWorker.aadhaarBack)}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs"
                        >
                          <Maximize2 className="w-4 h-4" />
                          <span>Inspect Full Size</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <FileText className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px]">No Back Photo Provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar (Approve vs Reject) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Reject KYC</span>
              </button>

              <button
                onClick={() => handleApprove(selectedWorker.id)}
                disabled={actionLoading || selectedWorker.kycStatus === 'APPROVED'}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve Worker & Unlock App Access</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-3 shadow-2xl relative"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Aadhaar Inspection"
              className="max-h-[82vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Worker Verification</h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason so the worker knows what to correct (e.g. blurry Aadhaar image, details not matching).
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Aadhaar card front photo is blurry. Please upload a clear photo."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
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
