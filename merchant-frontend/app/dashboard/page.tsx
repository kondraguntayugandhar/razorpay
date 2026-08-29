'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  RotateCcw,
  Building2,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  ArrowUp
} from 'lucide-react';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M'>('7D');

  const recentPayments = [
    {
      id: 'pay_NkkX8a1',
      name: 'Rahul Jain',
      email: 'rahul@example.com',
      initials: 'RJ',
      avatarBg: 'bg-blue-100 text-blue-700',
      amount: '₹12,450.00',
      method: 'UPI',
      status: 'Success',
      statusType: 'success',
    },
    {
      id: 'pay_Nkk7b9',
      name: 'Anita Sharma',
      email: 'anita.s@example.com',
      initials: 'AS',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      amount: '₹4,200.00',
      method: 'Card **** 4242',
      status: 'Success',
      statusType: 'success',
    },
    {
      id: 'pay_Nkk5m3',
      name: 'Vikram Kumar',
      email: '+91 98765 43210',
      initials: 'VK',
      avatarBg: 'bg-purple-100 text-purple-700',
      amount: '₹89,999.00',
      method: 'Netbanking',
      status: 'Failed',
      statusType: 'failed',
    },
    {
      id: 'pay_Nkk5z8',
      name: 'Priya Reddy',
      email: 'priya.r@example.com',
      initials: 'PR',
      avatarBg: 'bg-amber-100 text-amber-700',
      amount: '₹1,500.00',
      method: 'UPI',
      status: 'Processing',
      statusType: 'processing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Here's what's happening with your payments.</p>
      </div>

      {/* TOP 4 STAT CARDS IN BOX SHAPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL PAYMENTS */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">TOTAL PAYMENTS</span>
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">₹24,58,320</h2>
          </div>
          <div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <ArrowUp className="w-3 h-3" />
              <span>12.4% vs last month</span>
            </span>
          </div>
        </div>

        {/* Card 2: SUCCESSFUL PAYMENTS */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SUCCESSFUL PAYMENTS</span>
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">₹22,94,120</h2>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              93.3% rate
            </span>
          </div>
        </div>

        {/* Card 3: REFUNDS */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">REFUNDS</span>
            <RotateCcw className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">₹1,24,500</h2>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200">
              142 transactions
            </span>
          </div>
        </div>

        {/* Card 4: NEXT SETTLEMENT */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">NEXT SETTLEMENT</span>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">₹18,42,300</h2>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200">
              Expected 29 Aug
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: PAYMENT VOLUME CHART & PAYMENT METHODS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PAYMENT VOLUME CARD (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Payment volume</h3>
            {/* Time toggle controls */}
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-[11px] font-semibold">
              {(['7D', '30D', '3M'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-white text-gray-900 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* SVG CHART CANVAS */}
          <div className="relative pt-4 pb-2">
            <div className="flex">
              {/* Y-AXIS LABELS */}
              <div className="flex flex-col justify-between text-[10px] font-medium text-gray-400 h-48 pr-3 text-right shrink-0">
                <span>₹1M</span>
                <span>₹750k</span>
                <span>₹500k</span>
                <span>₹250k</span>
                <span>0</span>
              </div>

              {/* CHART AREA WITH GRID LINES */}
              <div className="flex-1 h-48 relative border-b border-gray-100">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-gray-100 w-full"></div>
                  <div className="border-b border-gray-100 w-full"></div>
                  <div className="border-b border-gray-100 w-full"></div>
                  <div className="border-b border-gray-100 w-full"></div>
                  <div className="w-full"></div>
                </div>

                {/* SVG Curve */}
                <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill under curve */}
                  <path
                    d="M 0 130 C 50 110, 80 80, 130 95 C 180 110, 230 140, 280 120 C 330 100, 370 20, 420 20 C 470 20, 490 60, 500 70 L 500 180 L 0 180 Z"
                    fill="url(#blueGradient)"
                  />

                  {/* Smooth curved line */}
                  <path
                    d="M 0 130 C 50 110, 80 80, 130 95 C 180 110, 230 140, 280 120 C 330 100, 370 20, 420 20 C 470 20, 490 60, 500 70"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Highlighted Dot matching screenshot on Sat */}
                  <circle cx="420" cy="20" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" className="shadow-md" />
                </svg>

                {/* TOOLTIP OVERLAY MATCHING SCREENSHOT */}
                <div className="absolute left-[78%] top-[-8px] -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl border border-gray-800 z-10 text-center">
                  <p className="text-gray-400 font-medium">28 Aug, 14:00</p>
                  <p className="font-bold text-white text-xs">₹82,450</p>
                </div>
              </div>
            </div>

            {/* X-AXIS LABELS */}
            <div className="flex justify-between pl-10 text-[11px] font-medium text-gray-400 mt-3">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS DONUT CARD (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-900">Payment methods</h3>

          {/* DONUT CHART SVG */}
          <div className="my-4 flex items-center justify-center relative">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              {/* UPI Arc (58%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#2563eb"
                strokeWidth="18"
                strokeDasharray="218.6 377"
                strokeDashoffset="0"
                transform="rotate(-90 80 80)"
              />
              {/* Cards Arc (25%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#4f46e5"
                strokeWidth="18"
                strokeDasharray="94.2 377"
                strokeDashoffset="-218.6"
                transform="rotate(-90 80 80)"
              />
              {/* Netbanking Arc (17%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth="18"
                strokeDasharray="64.2 377"
                strokeDashoffset="-312.8"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-gray-900">58%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">UPI</span>
            </div>
          </div>

          {/* LEGEND ITEMS */}
          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
                <span className="text-gray-700">UPI</span>
              </div>
              <span className="text-gray-900 font-bold">58%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                <span className="text-gray-700">Cards</span>
              </div>
              <span className="text-gray-900 font-bold">25%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm bg-sky-400"></div>
                <span className="text-gray-700">Netbanking</span>
              </div>
              <span className="text-gray-900 font-bold">17%</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT PAYMENTS TABLE CARD IN BOX SHAPE */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900">Recent payments</h3>
          <Link href="/payments" className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1">
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">PAYMENT ID</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">METHOD</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-500 font-semibold text-[11px]">
                    {p.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${p.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {p.initials}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{p.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold border border-gray-200">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.statusType === 'success' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <span>✓</span>
                        <span>Success</span>
                      </span>
                    )}
                    {p.statusType === 'failed' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                        <span>✕</span>
                        <span>Failed</span>
                      </span>
                    )}
                    {p.statusType === 'processing' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        <span>⏱</span>
                        <span>Processing</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="flex items-center justify-between pt-3 text-xs text-gray-400 font-medium border-t border-gray-100">
          <span>Showing 4 of 2,458 payments</span>
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
