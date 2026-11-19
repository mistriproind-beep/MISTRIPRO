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
  HardHat,
  Search,
  ChevronDown,
  Layers,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, adminEmail, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch live count of pending worker KYC approvals from Supabase
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
        setPendingCount(0);
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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-slate-500">Loading MistriPro Portal...</span>
        </div>
      </div>
    );
  }

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
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
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
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
          name: 'Broadcast & Notifications',
          href: '/notifications',
          icon: Bell,
          badge: null,
        },
      ],
    },
    {
      title: 'FINANCE & CONFIG',
      items: [
        {
          name: 'Payments & Settlement',
          href: '/payments',
          icon: CreditCard,
          badge: null,
        },
        {
          name: 'Platform Settings & Rates',
          href: '/settings',
          icon: Sliders,
          badge: null,
        },
        {
          name: 'Customer Reviews',
          href: '/reviews',
          icon: Star,
          badge: null,
        },
        {
          name: 'Contractor Projects',
          href: '/projects',
          icon: HardHat,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] font-sans antialiased text-slate-900">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-base shadow-sm">
              M
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                MistriPro™
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Admin Control Center
              </span>
            </div>
          </div>

          {/* Workspace Pill Dropdown */}
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-700 transition">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>MistriPro HQ (Live)</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Quick Search Trigger */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Quick search...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            item.badgeColor || 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Superuser Profile Card */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                SA
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">Super Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">{adminEmail || 'admin@mistripro.com'}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60">
              <Link
                href="/settings"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">
              {pathname === '/'
                ? 'Overview Dashboard'
                : pathname === '/workers'
                ? 'Worker Verification & KYC'
                : pathname === '/users'
                ? 'User Management'
                : pathname === '/orders'
                ? 'Orders & Operations'
                : pathname === '/payments'
                ? 'Financial Ledger & Payouts'
                : pathname === '/settings'
                ? 'Platform Rates & Settings'
                : pathname === '/reviews'
                ? 'Reviews & Ratings'
                : 'Project Management'}
            </h1>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Live Supabase Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Urgent Pending Badge Shortcut */}
            {pendingCount > 0 && (
              <Link
                href="/workers"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>{pendingCount} KYC Pending</span>
              </Link>
            )}

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                Refresh Data
              </button>
              <Link
                href="/settings"
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
              >
                Settings & Rates
              </Link>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 p-8 min-w-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
