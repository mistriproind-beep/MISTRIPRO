'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, Users, IndianRupee, RefreshCw, Calendar, Phone, CheckCircle2 } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Fetch contractor & crew projects from bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or('service_type.ilike.%crew%,service_type.ilike.%contractor%,booking_code.ilike.%CREW%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.log('Error fetching contractor projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contractor Crew & Bulk Projects Moderation</h2>
          <p className="text-sm text-slate-500 mt-1">
            Realtime customer requests for contractor crews, multi-worker site dispatch, and project management.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Projects</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading contractor projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-sm space-y-2">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Contractor Crew Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When customers book whole contractor crews (₹599 Contractor Booking Fee) on the mobile app, they will appear here live.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-blue-100 text-[#263A8B] px-2.5 py-1 rounded">
                      {proj.booking_code || `PRJ-${String(proj.id).slice(0, 6).toUpperCase()}`}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {proj.service_type || 'Group Contractor Crew Dispatch'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>Customer: <strong className="text-slate-800">{proj.customer_name || 'Customer'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      {proj.customer_phone || '—'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {proj.address || 'Site Location'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    ₹{proj.total_amount || 599} Crew Booking Fee Paid
                  </span>
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                    Status: {proj.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Work Scope / Notes */}
              <div className="border rounded-lg p-4 bg-slate-50 space-y-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Work Scope & Site Address
                </h4>
                <p className="text-xs text-slate-600">
                  {proj.address || 'Work address provided upon customer payment.'}
                </p>
                {proj.notes && (
                  <p className="text-xs text-slate-500 italic mt-1">Note: {proj.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
