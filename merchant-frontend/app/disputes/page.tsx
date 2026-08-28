'use client';

import React, { useState } from 'react';
import { Search, AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function DisputesPage() {
  const [query, setQuery] = useState('');

  const disputes = [
    {
      id: 'disp_FP99812',
      paymentId: 'pay_FP839185',
      amount: '₹850.00',
      reason: 'Product not received / Fraudulent claim',
      status: 'Action Required',
      statusColor: 'text-rose-700 bg-rose-100',
      dueDate: '2 days left to submit evidence',
      customer: 'Amit Singh',
    },
    {
      id: 'disp_FP99810',
      paymentId: 'pay_FP839100',
      amount: '₹3,200.00',
      reason: 'Duplicate payment processed',
      status: 'Under Review',
      statusColor: 'text-amber-700 bg-amber-100',
      dueDate: 'Submitted on Oct 20, 2026',
      customer: 'Kavita Rao',
    },
    {
      id: 'disp_FP99801',
      paymentId: 'pay_FP839005',
      amount: '₹1,500.00',
      reason: 'Services not as described',
      status: 'Won by Merchant',
      statusColor: 'text-emerald-700 bg-emerald-100',
      dueDate: 'Resolved on Oct 15, 2026',
      customer: 'Rohan Sharma',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage chargebacks, bank disputes, and submit compelling evidence</p>
        </div>

        <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <FileText className="w-4 h-4" />
          <span>Dispute Policy Guide</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Active Disputes</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">2</h2>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Action required on 1 dispute</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Dispute Amount</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹4,050.00</h2>
          <p className="text-[11px] text-gray-400 font-medium mt-1">0.02% of volume</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Disputes Won</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">88.5%</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">High victory rate</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Chargeback Ratio</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">0.05%</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Well below 1% threshold</p>
        </div>
      </div>

      {/* DISPUTES TABLE */}
      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Dispute ID, Payment ID, Customer..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Dispute ID</th>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Dispute Reason</th>
                <th className="py-3 px-4">Disputed Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline / Result</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{d.id}</td>
                  <td className="py-3.5 px-4 font-mono text-blue-600">{d.paymentId}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{d.customer}</td>
                  <td className="py-3.5 px-4 text-gray-600">{d.reason}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{d.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${d.statusColor}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{d.dueDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors">
                      Submit Evidence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
