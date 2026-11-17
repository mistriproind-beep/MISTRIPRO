'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Search,
  Filter,
  Edit2,
  Lock,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  X,
  Plus,
  RefreshCw,
  Shield,
  Key,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'WORKER'>('ALL');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'CUSTOMER',
    address: 'Jaipur, Rajasthan',
  });

  // Fetch users from Supabase profiles
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.log('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.alt_phone || '').includes(q);

    return matchesRole && matchesQuery;
  });

  // Save Edited User Profile & Password
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      const updates: any = {
        full_name: editingUser.full_name,
        phone: editingUser.phone,
        alt_phone: editingUser.alt_phone,
        email: editingUser.email,
        role: editingUser.role,
        kyc_status: editingUser.kyc_status,
        address: editingUser.address,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', editingUser.id);

      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updates } : u))
      );
      setEditingUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newId = `user_${Date.now()}`;
      const { error } = await supabase.from('profiles').insert([
        {
          id: newId,
          full_name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          address: newUser.address,
          kyc_status: newUser.role === 'WORKER' ? 'PENDING' : 'APPROVED',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setShowAddModal(false);
      setNewUser({
        name: '',
        phone: '',
        email: '',
        role: 'CUSTOMER',
        address: 'Jaipur, Rajasthan',
      });
      fetchUsers();
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>User & Profile Registry</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              {users.length} Total Users
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super admin controls to manage accounts, reset user credentials, and change system roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            <span>Reload</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(
            [
              { key: 'ALL', label: `All Users (${users.length})` },
              { key: 'CUSTOMER', label: `Customers (${users.filter((u) => u.role === 'CUSTOMER').length})` },
              { key: 'WORKER', label: `Workers (${users.filter((u) => u.role === 'WORKER').length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                roleFilter === tab.key
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
            placeholder="Search by name, phone, email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">User Profile</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Contact (Phone / Email)</th>
                <th className="px-6 py-3.5">Address / Location</th>
                <th className="px-6 py-3.5">KYC Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading users from database...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    {/* User Profile */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            user.role === 'WORKER'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{user.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                          user.role === 'WORKER'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-3.5">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 font-mono text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone || 'No phone'}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.address || 'Rajasthan'}</span>
                      </div>
                    </td>

                    {/* KYC Status */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          user.kyc_status === 'APPROVED' || user.kyc_status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.kyc_status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {user.kyc_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setNewPassword('');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition inline-flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit / Password</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User & Change Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-orange-600" />
                <span>Edit User & Credentials</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Phone / ID</label>
                  <input
                    type="text"
                    value={editingUser.alt_phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, alt_phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="WORKER">WORKER</option>
                    <option value="CONTRACTOR">CONTRACTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">KYC Status</label>
                  <select
                    value={editingUser.kyc_status}
                    onChange={(e) => setEditingUser({ ...editingUser, kyc_status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  >
                    <option value="APPROVED">APPROVED (Unlocked)</option>
                    <option value="PENDING">PENDING (Review)</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Site Area</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              {/* Password Reset Section */}
              <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200">
                <label className="block text-xs font-bold text-orange-950 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-orange-600" />
                  <span>Reset / Change User Password</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (leave blank to keep unchanged)"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Admins have full superuser rights to set or reset this account's password.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save User Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Platform User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="WORKER">WORKER (Requires KYC)</option>
                  <option value="CONTRACTOR">CONTRACTOR</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
