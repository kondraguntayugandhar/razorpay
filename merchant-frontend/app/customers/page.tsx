'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const customers = [
    {
      id: 'cust_8G3K9F2',
      name: 'Priya Kumar',
      email: 'priya.k@example.com',
      phone: '+91 98765 43210',
      initials: 'PK',
      avatarBg: 'bg-blue-100 text-blue-700',
      payments: 24,
      totalSpent: '₹1,45,200.00',
      lastPayment: 'Today, 2:30 PM',
      lastPaymentStatus: 'success',
      created: 'Oct 12, 2022',
    },
    {
      id: 'cust_0M4F2L1',
      name: 'Sneha Reddy',
      email: 'sneha.r@startup.io',
      phone: '+91 01234 56789',
      initials: 'SR',
      avatarBg: 'bg-amber-100 text-amber-700',
      payments: 8,
      totalSpent: '₹42,850.50',
      lastPayment: 'Yesterday, 11:15 AM',
      lastPaymentStatus: 'pending',
      created: 'Jan 05, 2023',
    },
    {
      id: 'cust_3A887C6',
      name: 'Rahul Sharma',
      email: 'rahul.s@gmail.com',
      phone: '+91 99887 76655',
      initials: 'RS',
      avatarBg: 'bg-rose-100 text-rose-700',
      payments: 1,
      totalSpent: '₹1,200.00',
      lastPayment: 'Oct 24, 2023',
      lastPaymentStatus: 'failed',
      created: 'Oct 24, 2023',
    },
    {
      id: 'cust_7K9Y2Z4',
      name: 'Anita Joshi',
      email: 'anita.joshi@design.co',
      phone: '+91 98111 22233',
      initials: 'AJ',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      payments: 12,
      totalSpent: '₹89,500.00',
      lastPayment: 'Oct 20, 2023',
      lastPaymentStatus: 'success',
      created: 'Mar 15, 2022',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and analyze your customer base.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs">
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* 4 STAT CARDS IN BOX SHAPE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">12,450</h2>
            <span className="text-[11px] font-semibold text-emerald-600">+8.2%</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">New Customers (30d)</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">842</h2>
            <span className="text-[11px] font-semibold text-emerald-600">+12.5%</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Repeat Rate</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">42.8%</h2>
            <span className="text-[11px] font-semibold text-emerald-600">+1.2%</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Customer Value</span>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-gray-900">₹48.2M</h2>
            <span className="text-[11px] font-semibold text-emerald-600">+5.4%</span>
          </div>
        </div>
      </div>

      {/* FILTER & TABLE BOX CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs text-gray-400 font-medium">Showing 1-10 of 12,450</span>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Payments</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${c.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {c.initials}
                      </div>
                      <div>
                        <Link href={`/customers/${c.id}`} className="font-bold text-gray-900 hover:text-blue-600 block">
                          {c.name}
                        </Link>
                        <span className="font-mono text-[10px] text-gray-400">{c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-gray-900 font-medium">{c.email}</p>
                    <p className="text-[10px] text-gray-400">{c.phone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{c.payments}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{c.totalSpent}</td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <p className="text-gray-900 font-medium">{c.lastPayment}</p>
                      {c.lastPaymentStatus === 'success' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-200">
                          Success
                        </span>
                      )}
                      {c.lastPaymentStatus === 'pending' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold text-amber-700 bg-amber-50 rounded border border-amber-200">
                          Pending
                        </span>
                      )}
                      {c.lastPaymentStatus === 'failed' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold text-rose-700 bg-rose-50 rounded border border-rose-200">
                          Failed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[11px]">{c.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Rows per page: 10</span>
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
