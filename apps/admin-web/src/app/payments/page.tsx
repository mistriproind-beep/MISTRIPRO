'use client';

import React from 'react';
import { IndianRupee, ShieldCheck, CheckCircle2, Download } from 'lucide-react';

export default function PaymentsPage() {
  const transactions = [
    {
      id: 'tx_mp_101',
      orderId: 'order_mp_26110001',
      paymentId: 'pay_rzp_8928374',
      projectCode: 'MISTRI-26110001',
      customerName: 'Ramesh Sharma',
      amount: '₹299.00',
      purpose: 'Platform Request Listing Fee',
      status: 'VERIFIED',
      date: '13 Nov 2026, 11:20 AM',
    },
    {
      id: 'tx_mp_102',
      orderId: 'order_mp_26110002',
      paymentId: 'pay_rzp_8928491',
      projectCode: 'MISTRI-26110002',
      customerName: 'Anita Desai',
      amount: '₹299.00',
      purpose: 'Platform Request Listing Fee',
      status: 'VERIFIED',
      date: '13 Nov 2026, 09:45 AM',
    },
    {
      id: 'tx_mp_103',
      orderId: 'order_mp_26110003',
      paymentId: 'pay_rzp_8928512',
      projectCode: 'MISTRI-26110003',
      customerName: 'Kunal Verma',
      amount: '₹299.00',
      purpose: 'Platform Request Listing Fee',
      status: 'VERIFIED',
      date: '12 Nov 2026, 04:10 PM',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">₹299 Platform Listing Fee Auditing</h2>
          <p className="text-sm text-slate-500 mt-1">
            Reconcile Razorpay cryptographic signatures, published listings, and transaction receipts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Project ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Razorpay Payment ID</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                <td className="p-4 font-mono font-bold text-blue-900">{tx.projectCode}</td>
                <td className="p-4 font-medium text-slate-800">{tx.customerName}</td>
                <td className="p-4 font-mono text-slate-600">{tx.paymentId}</td>
                <td className="p-4 font-extrabold text-slate-900">{tx.amount}</td>
                <td className="p-4 text-slate-600">{tx.purpose}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
