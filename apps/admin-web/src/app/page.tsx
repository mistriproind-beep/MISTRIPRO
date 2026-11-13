import React from 'react';
import {
  Users,
  ShieldCheck,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Workers',
      value: '1,420',
      change: '+18% this month',
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'KYC Pending Review',
      value: '42',
      change: '24–48h SLA Active',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Active Work Tenders',
      value: '184',
      change: '88% matching rate',
      icon: Briefcase,
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Listing Revenue (₹299)',
      value: '₹55,016',
      change: '184 published posts',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Operations Control Center</h2>
        <p className="text-sm text-slate-500 mt-1">
          Monitor incoming worker KYC submissions, active construction tenders, and listing fee settlements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">{stat.value}</span>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent KYC Verification Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Urgent Worker KYC Queue</h3>
              <p className="text-xs text-slate-500">Requires verification before workers can discover & bid on tenders</p>
            </div>
            <Link
              href="/workers"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              View all 42
            </Link>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'WP-2026-00125',
                name: 'Rajesh Kumar',
                skill: 'Mason (राजमिस्त्री)',
                city: 'Jaipur, RJ',
                exp: '8 Years',
                idType: 'Aadhaar (Masked)',
                time: '2 hours ago',
              },
              {
                id: 'WP-2026-00126',
                name: 'Mohan Lal Suthar',
                skill: 'Carpenter (बढ़ई)',
                city: 'Ahmedabad, GJ',
                exp: '12 Years',
                idType: 'Voter ID',
                time: '4 hours ago',
              },
              {
                id: 'WP-2026-00127',
                name: 'Sunil Shinde',
                skill: 'Electrician (इलेक्ट्रीशियन)',
                city: 'Pune, MH',
                exp: '5 Years',
                idType: 'Aadhaar (Masked)',
                time: '6 hours ago',
              },
            ].map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{worker.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                      {worker.skill}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>{worker.id}</span>
                    <span>•</span>
                    <span>{worker.city}</span>
                    <span>•</span>
                    <span>{worker.exp}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{worker.idType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/workers?id=${worker.id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#263A8B] text-white rounded-lg hover:bg-blue-900 transition"
                  >
                    Review KYC
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Tender Monitoring */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 mb-1">Live Tender Activity</h3>
          <p className="text-xs text-slate-500 mb-6">Recent customer requests & ₹299 settlements</p>

          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">MISTRI-26110001</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ₹299 Paid
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">Bathroom Renovation</p>
              <p className="text-xs text-slate-500">Vaishali Nagar, Jaipur • 3 Masons, 5 Labourers</p>
              <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>3 of 8 filled</span>
                <span className="text-amber-600">Matching Wave 1 (0-5 km)</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">MISTRI-26110002</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ₹299 Paid
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">Commercial False Ceiling</p>
              <p className="text-xs text-slate-500">Mansarovar, Jaipur • 2 POP Specialists</p>
              <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>2 of 2 filled</span>
                <span className="text-emerald-600 font-semibold">Requirement Filled</span>
              </div>
            </div>
          </div>

          <Link
            href="/projects"
            className="w-full mt-6 py-2.5 text-center text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Manage All Active Tenders
          </Link>
        </div>
      </div>
    </div>
  );
}
