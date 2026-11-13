'use client';

import React from 'react';
import { Briefcase, MapPin, Users, IndianRupee, ExternalLink } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      id: 'proj-demo-001',
      code: 'MISTRI-26110001',
      title: 'Residential House Construction & Renovation',
      customer: 'Ramesh Sharma',
      city: 'Jaipur, Rajasthan',
      budget: '₹50,000 (Negotiable)',
      listingFee: '₹299 Paid',
      status: 'PUBLISHED',
      requirements: [
        { skill: 'Mason (राजमिस्त्री)', needed: 3, selected: 2, remaining: 1 },
        { skill: 'Construction Labour (मजदूर)', needed: 5, selected: 1, remaining: 4 },
      ],
      matchingWave: 'Wave 1 (0–5 km)',
    },
    {
      id: 'proj-demo-002',
      code: 'MISTRI-26110002',
      title: 'Commercial Office POP False Ceiling & Electrical',
      customer: 'Anita Desai',
      city: 'Jaipur, Rajasthan',
      budget: '₹28,000 (Fixed)',
      listingFee: '₹299 Paid',
      status: 'PUBLISHED',
      requirements: [
        { skill: 'POP Specialist', needed: 2, selected: 2, remaining: 0 },
        { skill: 'Electrician', needed: 1, selected: 1, remaining: 0 },
      ],
      matchingWave: 'Wave 2 (5–10 km)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects & Tenders Moderation</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track published work requests, vacancy counts, matching waves, and hiring progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold bg-blue-100 text-[#263A8B] px-2.5 py-1 rounded">
                    {proj.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{proj.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span>Customer: {proj.customer}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {proj.city}
                  </span>
                  <span>•</span>
                  <span>Budget: {proj.budget}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {proj.listingFee}
                </span>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {proj.matchingWave}
                </span>
              </div>
            </div>

            {/* Requirement Breakdown */}
            <div className="border rounded-lg p-4 bg-slate-50 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vacancy Management Matrix
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proj.requirements.map((req, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-md border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{req.skill}</p>
                      <p className="text-slate-500">
                        Required: <span className="font-bold text-slate-700">{req.needed}</span> |
                        Selected: <span className="font-bold text-blue-700">{req.selected}</span>
                      </p>
                    </div>
                    <div>
                      {req.remaining === 0 ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Filled
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          {req.remaining} Vacancy Left
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
