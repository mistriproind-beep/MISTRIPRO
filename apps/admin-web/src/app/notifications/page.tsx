'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  Megaphone,
  Send,
  Users,
  HardHat,
  User,
  AlertTriangle,
  Gift,
  Info,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Search,
  Sparkles,
} from 'lucide-react';

interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  target: 'ALL' | 'WORKER' | 'CUSTOMER' | 'USER';
  targetName?: string;
  targetPhone?: string;
  type: 'ANNOUNCEMENT' | 'ALERT' | 'OFFER' | 'UPDATE';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface UserOption {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export default function NotificationsBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [target, setTarget] = useState<'ALL' | 'WORKER' | 'CUSTOMER' | 'USER'>('ALL');
  const [notifType, setNotifType] = useState<'ANNOUNCEMENT' | 'ALERT' | 'OFFER' | 'UPDATE'>('ANNOUNCEMENT');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Specific User State
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearch, setUserSearch] = useState('');

  // 1. Fetch Users for Specific Target Picker
  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .in('role', ['CUSTOMER', 'WORKER'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        setAllUsers(
          data.map((u) => ({
            id: u.id,
            name: u.full_name || 'Unnamed User',
            phone: u.phone || 'No Phone',
            role: u.role || 'CUSTOMER',
          }))
        );
      }
    } catch (e) {
      console.log('Error fetching user list:', e);
    }
  };

  // 2. Fetch Broadcast History from Supabase
  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, alt_phone, address, city, state, created_at')
        .eq('role', 'ADMIN')
        .eq('state', 'BROADCAST')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: BroadcastRecord[] = (data || []).map((item) => {
        let details: any = {};
        try {
          details = JSON.parse(item.address || '{}');
        } catch (e) {
          details = { message: item.address };
        }
        return {
          id: item.id,
          title: details.title || item.full_name?.replace('[BROADCAST] ', '') || 'System Broadcast',
          message: details.message || '',
          target: (item.city as any) || details.target || 'ALL',
          targetName: details.targetName || '',
          targetPhone: item.alt_phone || '',
          type: details.type || 'ANNOUNCEMENT',
          priority: details.priority || 'NORMAL',
          createdAt: item.created_at || new Date().toISOString(),
        };
      });

      setBroadcasts(formatted);
    } catch (err: any) {
      console.log('Error fetching broadcasts:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    fetchUsers();
  }, []);

  // 3. Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter both Notification Title and Message Body');
      return;
    }

    if (target === 'USER' && !selectedUserId) {
      alert('Please select a target user from the registry');
      return;
    }

    setSending(true);
    setSuccessMsg(null);

    const selectedUser = allUsers.find((u) => u.id === selectedUserId);

    try {
      const payloadDetails = {
        title: title.trim(),
        message: message.trim(),
        target,
        targetName: selectedUser?.name || '',
        type: notifType,
        priority,
        sentAt: new Date().toISOString(),
      };

      const record = {
        role: 'ADMIN',
        full_name: `[BROADCAST] ${title.trim()}`,
        phone: 'BROADCAST_SYSTEM',
        alt_phone: target === 'USER' ? selectedUser?.phone || selectedUserId : target,
        address: JSON.stringify(payloadDetails),
        city: target,
        state: 'BROADCAST',
        kyc_status: 'VERIFIED',
      };

      const { data, error } = await supabase.from('profiles').insert([record]).select();
      if (error) throw error;

      setSuccessMsg(`Broadcast sent successfully to ${target === 'ALL' ? 'all users' : target === 'WORKER' ? 'all workers' : target === 'CUSTOMER' ? 'all customers' : selectedUser?.name}!`);
      setTitle('');
      setMessage('');
      setSelectedUserId('');
      fetchBroadcasts();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`Error broadcasting notification: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // 4. Delete / Retract Broadcast
  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm('Are you sure you want to retract and delete this broadcast notification?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(`Failed to delete broadcast: ${err.message}`);
    }
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch)
  );

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Broadcast Notifications Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
              Live App Push & In-App Sync
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Dispatch instant notifications, alerts, and announcements to all users, workers, or specific registered users.
          </p>
        </div>

        <button
          onClick={fetchBroadcasts}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Broadcast Composition Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Compose New Broadcast</h2>
            <p className="text-xs text-slate-500">
              Broadcast instantly reaches live mobile apps without requiring an app store update.
            </p>
          </div>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-6">
          {/* Target Audience Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Target Audience
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'ALL', label: 'All Users', sub: 'Customers & Workers', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                { id: 'WORKER', label: 'All Workers', sub: 'Mistris & Labour', icon: HardHat, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                { id: 'CUSTOMER', label: 'All Customers', sub: 'Clients & Site Owners', icon: User, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { id: 'USER', label: 'Specific User', sub: 'Single Selected Account', icon: Search, color: 'text-blue-600 bg-blue-50 border-blue-200' },
              ].map((opt) => {
                const isSel = target === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTarget(opt.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSel
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSel && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{opt.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Specific User is Selected, show user dropdown / search */}
          {target === 'USER' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Choose Specific Recipient from Database:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users by name or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="">-- Choose User ({filteredUsers.length} available) --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) • {u.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Notification Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ANNOUNCEMENT', label: 'Announcement', icon: Megaphone },
                  { id: 'ALERT', label: 'Urgent Alert', icon: AlertTriangle },
                  { id: 'OFFER', label: 'Offer & Bonus', icon: Gift },
                  { id: 'UPDATE', label: 'Policy Update', icon: Info },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNotifType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                      notifType === item.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Delivery Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NORMAL', label: 'Normal', color: 'text-slate-700' },
                  { id: 'HIGH', label: 'High', color: 'text-amber-700' },
                  { id: 'URGENT', label: 'Urgent 🚨', color: 'text-red-700' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                      priority === p.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title & Body */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Notification Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali Booking Bonus: 0% Platform Commission This Week! 🪔"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Notification Message Content *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write clear, engaging notification content that will appear on mobile lockscreens and in-app notification center..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Delivered immediately via Supabase Realtime to connected mobile apps.
            </span>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Broadcasting...' : 'Dispatch Broadcast Now'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Sent History */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Sent Broadcast History ({broadcasts.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Active records in Supabase Cloud</span>
        </div>

        {broadcasts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-bold text-slate-600">No Broadcasts Dispatched Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to send your first platform notification.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {broadcasts.map((b) => (
              <div key={b.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{b.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.target === 'ALL'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : b.target === 'WORKER'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : b.target === 'CUSTOMER'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {b.target === 'ALL' ? 'All Users' : b.target === 'WORKER' ? 'Workers' : b.target === 'CUSTOMER' ? 'Customers' : `User: ${b.targetName || b.targetPhone}`}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {b.type}
                    </span>
                    {b.priority === 'URGENT' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{b.message}</p>
                  <p className="text-[10px] text-slate-400">
                    Sent: {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteBroadcast(b.id)}
                  title="Retract / Delete Notification"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
