'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Link2, Plus, Copy, Check, ExternalLink } from 'lucide-react';

export default function PaymentLinksPage() {
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const links = [
    {
      id: 'plink_FP991',
      title: 'Premium Subscription',
      amount: '₹4,999.00',
      status: 'Active',
      statusColor: 'text-emerald-700 bg-emerald-100',
      paymentsCount: 14,
      url: 'https://fastpay.me/plink_FP991',
      createdDate: 'Oct 20, 2026',
    },
    {
      id: 'plink_FP990',
      title: 'Consulting Retainer Fee',
      amount: '₹15,000.00',
      status: 'Active',
      statusColor: 'text-emerald-700 bg-emerald-100',
      paymentsCount: 3,
      url: 'https://fastpay.me/plink_FP990',
      createdDate: 'Oct 18, 2026',
    },
    {
      id: 'plink_FP988',
      title: 'Workshop Registration',
      amount: '₹999.00',
      status: 'Expired',
      statusColor: 'text-gray-700 bg-gray-100',
      paymentsCount: 45,
      url: 'https://fastpay.me/plink_FP988',
      createdDate: 'Oct 01, 2026',
    },
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Links Management</h1>
          <p className="text-xs text-gray-500 mt-1">Create shareable payment links with instant checkout and automated email reminders</p>
        </div>

        <Link
          href="/links/create"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payment Link</span>
        </Link>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Links</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">142</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">18 active links</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Collected via Links</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹5,42,100</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+22% this month</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Link Payments Count</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">380</h2>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">High conversion</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Partial Payment Links</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">12</h2>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Installments allowed</p>
        </div>
      </div>

      {/* PAYMENT LINKS TABLE */}
      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Link Title, Link ID, URL..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Link ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payments</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Link URL</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {links.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{l.id}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{l.title}</td>
                  <td className="py-3.5 px-4 font-extrabold text-gray-900">{l.amount}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{l.paymentsCount} payments</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${l.statusColor}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{l.url}</td>
                  <td className="py-3.5 px-4 text-gray-500">{l.createdDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleCopy(l.url, l.id)}
                      className="px-2.5 py-1 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center space-x-1 ml-auto"
                    >
                      {copiedId === l.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === l.id ? 'Copied' : 'Copy'}</span>
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
