import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Briefcase,
  CreditCard,
  Settings,
  LayoutDashboard,
  Bell,
  HardHat,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'MISTRI PRO – Admin Operations Dashboard',
  description: 'Verification, Project Tenders & Listing Fee Management Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#263A8B] text-white flex flex-col shrink-0 shadow-lg">
          <div className="p-6 border-b border-blue-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center font-bold text-slate-900 shadow-md">
              MP
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide">MISTRI PRO</h1>
              <p className="text-xs text-blue-200">Admin Operations</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition"
            >
              <LayoutDashboard className="w-5 h-5 text-amber-400" />
              Dashboard Overview
            </Link>
            <Link
              href="/workers"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Worker KYC Approvals
              <span className="ml-auto bg-amber-400 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                42
              </span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition"
            >
              <Briefcase className="w-5 h-5 text-amber-400" />
              Projects & Tenders
            </Link>
            <Link
              href="/payments"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition"
            >
              <CreditCard className="w-5 h-5 text-amber-400" />
              ₹299 Fees & Payments
            </Link>
          </nav>

          <div className="p-4 border-t border-blue-900/40 text-xs text-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Backend API: Online</span>
            </div>
            <p>MISTRI PRO Core v1.0.0</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Operations Center</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-slate-800">Jaipur District Hub</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm">
                  SA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Super Admin</p>
                  <p className="text-xs text-slate-500">ops@mistripro.in</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
