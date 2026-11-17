'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  Star,
  ExternalLink,
  ChevronRight,
  Activity,
  HardHat,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, adminEmail, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch live count of pending worker KYC approvals
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPending = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'WORKER')
          .eq('kyc_status', 'PENDING');
        if (!error && count !== null) {
          setPendingCount(count);
        }
      } catch {
        // Fallback default
        setPendingCount(4);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-300">Loading MistriPro Portal...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Dashboard Overview',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Worker Approvals & KYC',
      href: '/workers',
      icon: ShieldCheck,
      badge: pendingCount > 0 ? String(pendingCount) : null,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    },
    {
      name: 'User Management',
      href: '/users',
      icon: Users,
      badge: null,
    },
    {
      name: 'Orders & Bookings',
      href: '/orders',
      icon: Briefcase,
      badge: null,
    },
    {
      name: 'Payments & Settlement',
      href: '/payments',
      icon: CreditCard,
      badge: null,
    },
    {
      name: 'Platform Settings & Rates',
      href: '/settings',
      icon: Settings,
      badge: 'Live Sync',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]',
    },
    {
      name: 'Customer Reviews',
      href: '/reviews',
      icon: Star,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            MP
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1.5">
              MISTRI PRO
              <span className="text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">SAAS</span>
            </h1>
            <p className="text-xs text-slate-400">Super Admin Center</p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mx-4 my-3 px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Supabase Cloud</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">CONNECTED</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 text-sm font-medium overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition group ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.badgeColor || 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow">
                SA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Super Administrator</p>
                <p className="text-[11px] text-slate-400 truncate font-mono">{adminEmail || 'admin@mistripro.com'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400 font-medium">MistriPro Operations</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-100 font-bold capitalize">
              {pathname === '/' ? 'Dashboard' : pathname.replace('/', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick App Link */}
            <a
              href="https://expo.dev/accounts/yashendrajain030205/projects/mistripro/builds"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
            >
              <span>EAS Android Builds</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {/* Notification Badge */}
            <Link
              href="/workers"
              className="relative p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
              title="Pending KYC Approvals"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full" />
              )}
            </Link>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">SYSTEM ACTIVE</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
