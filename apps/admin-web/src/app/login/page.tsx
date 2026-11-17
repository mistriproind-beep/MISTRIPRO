'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Shield, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@mistripro.com');
  const [password, setPassword] = useState('MistriPro@Admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Failed to authenticate');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@mistripro.com');
    setPassword('MistriPro@Admin2026');
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#0B1536] to-slate-900 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20 mb-4 border border-amber-300/40">
            MP
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">MISTRI PRO</h1>
          <p className="text-slate-400 text-sm mt-1">Super Admin Operations & Control Center</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-6 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Secure Admin Authentication</span>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mistripro.com"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition transform active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2">Quick Access Demo Mode:</p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer transition"
            >
              Autofill Default Credentials (admin@mistripro.com)
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>256-Bit SSL Encrypted Admin Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
