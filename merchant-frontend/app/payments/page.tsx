'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function PaymentsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  const payments = [
    {
      id: 'pay_M3n9Lp2',
      orderId: 'order_K9v1',
      customer: 'John Doe',
      initials: 'JD',
      avatarBg: 'bg-blue-100 text-blue-700',
      amount: '4,500.00',
      method: 'Netbanking',
      status: 'Successful',
      statusType: 'success',
      createdDate: 'Oct 24, 2023, 14:32',
    },
    {
      id: 'pay_N4y8Mq1',
      orderId: 'order_L0w2',
      customer: 'Alice Smith',
      initials: 'AS',
      avatarBg: 'bg-purple-100 text-purple-700',
      amount: '1,250.50',
      method: 'Visa **** 4242',
      status: 'Pending',
      statusType: 'pending',
      createdDate: 'Oct 24, 2023, 14:15',
    },
    {
      id: 'pay_P5z7N0',
      orderId: 'order_M1r3',
      customer: 'Rahul Joshi',
      initials: 'RJ',
      avatarBg: 'bg-amber-100 text-amber-700',
      amount: '8,900.00',
      method: 'UPI',
      status: 'Failed',
      statusType: 'failed',
      createdDate: 'Oct 24, 2023, 13:45',
    },
    {
      id: 'pay_Q6a6Os9',
      orderId: 'order_N2y4',
      customer: 'Priya Kaur',
      initials: 'PK',
      avatarBg: 'bg-teal-100 text-teal-700',
      amount: '500.00',
      method: 'Wallet',
      status: 'Refunded',
      statusType: 'refunded',
      createdDate: 'Oct 24, 2023, 12:10',
    },
    {
      id: 'pay_R7b5P18',
      orderId: 'order_O3z5',
      customer: 'Sanjay Sharma',
      initials: 'SS',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      amount: '12,000.00',
      method: 'UPI',
      status: 'Successful',
      statusType: 'success',
      createdDate: 'Oct 24, 2023, 11:55',
    },
  ];

  return (
    <div className="space-y-5">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and track all your transactions.</p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center space-x-3">
          <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs transition-colors">
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <Link
            href="/links/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Payment</span>
          </Link>
        </div>
      </div>

      {/* FILTER BAR IN BOX SHAPE */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments, orders, refunds..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center space-x-2 text-xs">
          {/* Date Dropdown */}
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium flex items-center space-x-1.5 hover:bg-gray-50">
            <span>Last 7 Days</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Status Dropdown */}
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium flex items-center space-x-1.5 hover:bg-gray-50">
            <span>Status: {statusFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Method Dropdown */}
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium flex items-center space-x-1.5 hover:bg-gray-50">
            <span>Method: {methodFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Amount Dropdown */}
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium flex items-center space-x-1.5 hover:bg-gray-50">
            <span>Amount: Any</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* More Filters */}
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium flex items-center space-x-1.5 hover:bg-gray-50">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* TABLE IN BOX SHAPE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">PAYMENT ID</th>
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">AMOUNT (₹)</th>
                <th className="py-3 px-4">METHOD</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">CREATED DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 hover:underline">
                    <Link href={`/payments/${p.id}`}>{p.id}</Link>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">{p.orderId}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-full ${p.avatarBg} font-bold text-[10px] flex items-center justify-center shrink-0`}>
                        {p.initials}
                      </div>
                      <span className="font-bold text-gray-900">{p.customer}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{p.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-semibold border border-gray-200">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.statusType === 'success' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        Successful
                      </span>
                    )}
                    {p.statusType === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {p.statusType === 'failed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                        Failed
                      </span>
                    )}
                    {p.statusType === 'refunded' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200">
                        Refunded
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[11px]">{p.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 1 to 5 of 248 entries</span>
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
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
