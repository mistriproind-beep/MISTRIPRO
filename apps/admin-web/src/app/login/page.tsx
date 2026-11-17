'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Shield, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your Admin Email and Security Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Access denied.');
      }
    } catch {
      setError('Authentication gateway timed out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] relative overflow-hidden p-4 font-sans text-slate-900">
      {/* Ambient background glows matching reference design */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-orange-200/50 via-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-gradient-to-bl from-orange-100/60 via-amber-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-tr from-slate-200/40 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-4 border border-white/60">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20">
              <span className="font-black text-xl tracking-tighter">M</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            MistriPro™ Admin
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-normal">
            Enter your superuser credentials to manage platform operations
          </p>
        </div>

        {/* Floating Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Gateway</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
              <Shield className="w-3 h-3 text-slate-500" />
              <span>SSL Secured</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mistripro.com"
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-600 font-medium">Remember this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-slate-950/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Notice */}
        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Restricted Admin Portal • End-to-end encrypted session</span>
        </p>
      </div>
    </div>
  );
}
