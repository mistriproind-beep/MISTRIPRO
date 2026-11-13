'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  MapPin,
  Briefcase,
  UserCheck,
} from 'lucide-react';

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [workers, setWorkers] = useState([
    {
      id: 'WP-2026-00125',
      fullName: 'Rajesh Kumar',
      phone: '+91 98290 44556',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302021',
      primarySkill: 'Mason (राजमिस्त्री)',
      secondarySkills: ['Plastering', 'Stone Masonry'],
      yearsOfExperience: 8,
      dailyWageExpectation: 900,
      isTeamLeader: true,
      maxTeamSize: 4,
      preferredRadiusKm: 25,
      govtIdType: 'Aadhaar (Secure Vault)',
      govtIdMasked: 'XXXX-XXXX-4912',
      status: 'UNDER_REVIEW',
      submittedAt: '12 Nov 2026, 14:30',
      documents: [
        { name: 'Front ID Document', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500' },
        { name: 'Address Proof', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500' },
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500',
        'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?w=500',
      ],
    },
    {
      id: 'WP-2026-00126',
      fullName: 'Mohan Lal Suthar',
      phone: '+91 94140 12345',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      primarySkill: 'Carpenter / Furniture Maker (બળઈ)',
      secondarySkills: ['Modular Kitchen', 'Door Fitting'],
      yearsOfExperience: 12,
      dailyWageExpectation: 1100,
      isTeamLeader: false,
      maxTeamSize: 1,
      preferredRadiusKm: 20,
      govtIdType: 'Voter ID',
      govtIdMasked: 'XXXX-XXXX-9921',
      status: 'UNDER_REVIEW',
      submittedAt: '12 Nov 2026, 17:15',
      documents: [
        { name: 'Voter Card Copy', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500' },
      ],
      portfolio: [],
    },
  ]);

  const handleAction = (workerId: string, newStatus: string, reason?: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status: newStatus, rejectionReason: reason } : w)),
    );
    setSelectedWorker(null);
    setRejectReason('');
  };

  const filtered = workers.filter((w) => {
    if (activeTab === 'pending') return w.status === 'UNDER_REVIEW';
    if (activeTab === 'approved') return w.status === 'APPROVED';
    return w.status === 'REJECTED';
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Worker Verification & KYC</h2>
          <p className="text-sm text-slate-500 mt-1">
            Carefully verify identity and skills. Workers cannot bid on paid customer jobs until Approved.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'pending'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending Review ({workers.filter((w) => w.status === 'UNDER_REVIEW').length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'approved'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Approved ({workers.filter((w) => w.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'rejected'
              ? 'border-blue-700 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Rejected ({workers.filter((w) => w.status === 'REJECTED').length})
        </button>
      </div>

      {/* Worker List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((worker) => (
          <div
            key={worker.id}
            className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-900">{worker.fullName}</span>
                <span className="text-xs bg-blue-100 text-[#263A8B] font-semibold px-2.5 py-1 rounded-full">
                  {worker.primarySkill}
                </span>
                {worker.isTeamLeader && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">
                    Team Leader (Bring up to {worker.maxTeamSize})
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {worker.city}, {worker.state} ({worker.pincode})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {worker.yearsOfExperience} Years Exp
                </span>
                <span>•</span>
                <span>Radius: {worker.preferredRadiusKm} km</span>
                <span>•</span>
                <span>Expected Wage: ₹{worker.dailyWageExpectation}/day</span>
                <span>•</span>
                <span className="font-mono text-slate-700">{worker.govtIdType}: {worker.govtIdMasked}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedWorker(worker)}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                Inspect Documents
              </button>
              {worker.status === 'UNDER_REVIEW' && (
                <>
                  <button
                    onClick={() => handleAction(worker.id, 'APPROVED')}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason (e.g. Blurry ID card copy):');
                      if (reason) handleAction(worker.id, 'REJECTED', reason);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Inspector */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedWorker.fullName} – KYC Inspector</h3>
                <p className="text-xs text-slate-500">ID: {selectedWorker.id} • Submitted: {selectedWorker.submittedAt}</p>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Contact Number:</span>
                <p className="font-semibold text-slate-800">{selectedWorker.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Government ID:</span>
                <p className="font-semibold text-slate-800">{selectedWorker.govtIdType}: {selectedWorker.govtIdMasked}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Identity Documents (Encrypted Vault)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedWorker.documents.map((doc: any, i: number) => (
                  <div key={i} className="border rounded-lg p-2 bg-slate-50">
                    <p className="text-xs font-medium text-slate-600 mb-1">{doc.name}</p>
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-full h-36 object-cover rounded-md border"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => handleAction(selectedWorker.id, 'APPROVED')}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Approve Worker
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Reason for document revision:');
                  if (reason) handleAction(selectedWorker.id, 'REJECTED', reason);
                }}
                className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Request Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
