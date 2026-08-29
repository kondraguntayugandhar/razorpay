'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const refunds = [
    {
      id: 'rfnd_9kba7x8d5f',
      paymentId: 'pay_3a2b3c4d5e',
      customer: 'john.doe@example.com',
      initials: 'JD',
      avatarBg: 'bg-blue-100 text-blue-700',
      amount: '₹1,500.00',
      status: 'Processed',
      statusType: 'success',
      created: 'Oct 24, 10:42 AM',
    },
    {
      id: 'rfnd_3m4r5b6v7c',
      paymentId: 'pay_8f9g0h1i2j',
      customer: 'alice.smith@co.in',
      initials: 'AS',
      avatarBg: 'bg-purple-100 text-purple-700',
      amount: '₹12,450.00',
      status: 'Pending',
      statusType: 'pending',
      created: 'Oct 24, 09:15 AM',
    },
    {
      id: 'rfnd_1z2x3c4v5b',
      paymentId: 'pay_6m7n8o9p0q',
      customer: 'rahul.jain@tech.io',
      initials: 'RJ',
      avatarBg: 'bg-amber-100 text-amber-700',
      amount: '₹5,000.00',
      status: 'Failed',
      statusType: 'failed',
      created: 'Oct 23, 16:30 PM',
    },
    {
      id: 'rfnd_5t6y7u8i9o',
      paymentId: 'pay_0p1q2w3e4r',
      customer: 'priya.kapoor@mail.com',
      initials: 'PK',
      avatarBg: 'bg-teal-100 text-teal-700',
      amount: '₹850.50',
      status: 'Processed',
      statusType: 'success',
      created: 'Oct 23, 14:05 PM',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Refunds</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and track customer refunds.</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Refund Payment</span>
        </button>
      </div>

      {/* 4 STAT CARDS IN BOX SHAPE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Refunds (30d)</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">₹4,24,500</h2>
            <span className="text-[11px] font-semibold text-rose-600">↓ 12%</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Refunded Today</span>
          <h2 className="text-2xl font-extrabold text-gray-900">₹12,400</h2>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Refunds</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">₹45,000</h2>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-bold">12 items</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Failed Refunds</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">₹3,200</h2>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">2 items</span>
          </div>
        </div>
      </div>

      {/* FILTER & TABLE BOX CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Refund ID, Order ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-semibold text-gray-700 flex items-center space-x-1.5 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Filter</span>
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-semibold text-gray-700 flex items-center space-x-1.5 hover:bg-gray-50">
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">REFUND ID</th>
                <th className="py-3 px-4">PAYMENT ID</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">CREATED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {refunds.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{r.id}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">{r.paymentId}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full ${r.avatarBg} font-bold text-[9px] flex items-center justify-center shrink-0`}>
                        {r.initials}
                      </div>
                      <span className="font-bold text-gray-900">{r.customer}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-gray-900">{r.amount}</td>
                  <td className="py-3.5 px-4">
                    {r.statusType === 'success' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        Processed
                      </span>
                    )}
                    {r.statusType === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {r.statusType === 'failed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[11px]">{r.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 1 to 4 of 128 entries</span>
          <div className="flex items-center space-x-1.5">
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-2xs">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 font-semibold">
              2
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 font-semibold">
              3
            </button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 font-semibold">
              12
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
