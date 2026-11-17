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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Customer Reviews & Feedback</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              {reviews.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ratings and comments left by customers for completed mistri jobs.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading customer reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No customer reviews yet.</p>
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                      {(rev.customer_name || 'C').charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.customer_name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (rev.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment || 'Great service! Mistri arrived on time and finished properly.'}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Mistri: <strong className="text-slate-700">{rev.worker_name || 'Assigned Mistri'}</strong></span>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1 rounded text-red-500 hover:bg-red-50 transition"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
