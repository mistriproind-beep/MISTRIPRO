'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Star,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  User,
  HardHat,
} from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.log('Error fetching reviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this review?')) return;
    try {
      await supabase.from('reviews').delete().eq('id', id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(`Error deleting review: ${err.message}`);
    }
  };

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      (r.customer_name || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Customer Reviews & Quality Moderation
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30">
              {reviews.length} Total Reviews
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor client feedback, verify trade ratings, and moderate public feedback.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by customer or comment..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading reviews...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500">
            <Star className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No customer reviews found</p>
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    {rev.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{rev.customer_name || 'Customer'}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(rev.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-1">
                        {rev.rating || 5}.0
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                "{rev.comment || 'Excellent mistri work done on time!'}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Booking ID: #{rev.booking_id ? rev.booking_id.slice(0, 8) : 'DIRECT'}</span>
                <span>{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
