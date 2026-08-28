'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FastPayLogo } from '../../components/FastPayLogo';
import { BottomNav } from '../../components/BottomNav';
import {
  Bell,
  ChevronDown,
  Plus,
  TrendingUp,
  RotateCcw,
  Building2,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [isTestMode, setIsTestMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-2 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col pb-16">


        {/* HEADER */}
        <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-bold text-lg cursor-pointer">≡</span>
            <FastPayLogo size="md" />
          </div>

          <div className="flex items-center space-x-3">
            {/* Live / Test Toggle */}
            <div className="bg-gray-100 p-0.5 rounded-full flex items-center text-[10px] font-bold">
              <button
                onClick={() => setIsTestMode(false)}
                className={`px-2 py-0.5 rounded-full transition-colors ${!isTestMode ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-400'}`}
              >
                Live
              </button>
              <button
                onClick={() => setIsTestMode(true)}
                className={`px-2 py-0.5 rounded-full transition-colors ${isTestMode ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-400'}`}
              >
                Test
              </button>
            </div>

            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>
          </div>
        </header>

        <main className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* TITLE SECTION */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Here's what's happening with your payments today.</p>
          </div>

          {/* ACTION BUTTONS ROW */}
          <div className="flex items-center justify-between space-x-3">
            <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white flex items-center space-x-1.5 shadow-2xs">
              <span>Today</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <Link
              href="/links/create"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Payment Link</span>
            </Link>
          </div>

          {/* 4 VERTICAL ANALYTICS CARDS */}
          <div className="space-y-3">
            {/* Card 1: Total Payments */}
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Total Payments</p>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹24,58,320</h2>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.8% vs last period</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-lg shrink-0">
                ₹
              </div>
            </div>

            {/* Card 2: Success Rate */}
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Success Rate</p>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">93.3%</h2>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">+1.2% from average</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-lg shrink-0">
                ✓
              </div>
            </div>

            {/* Card 3: Refunds */}
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Refunds</p>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹1,24,500</h2>
                <p className="text-[11px] text-gray-400 font-medium mt-1">Across 42 transactions</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 font-extrabold flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Settlements */}
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Settlements</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">Next: 29 Aug</h2>
                <Link href="/settlements" className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center space-x-0.5 hover:underline">
                  <span>View Settlement Details</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 font-extrabold flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* PAYMENT VOLUME SMOOTH CHART */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-900">Payment Volume</span>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>

            {/* Smooth SVG Area Chart */}
            <div className="h-32 w-full relative">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 80 Q 50 60 75 75 T 150 40 T 225 60 T 300 10 L 300 100 L 0 100 Z"
                  fill="url(#gradient)"
                />
                <path
                  d="M 0 80 Q 50 60 75 75 T 150 40 T 225 60 T 300 10"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-medium text-gray-400 mt-2 px-1">
              <span>9am</span>
              <span>12pm</span>
              <span>3pm</span>
              <span>6pm</span>
              <span>9pm</span>
            </div>
          </div>

          {/* RECENT PAYMENTS LIST */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-900">Recent Payments</span>
              <Link href="/payments" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {/* Row 1 */}
              <Link href="/payments/pay_FP839201" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    AK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Anil Kumar</p>
                    <p className="text-[10px] font-mono text-gray-400">pay_LJ5x9xX2</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹4,500.00</p>
                  <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Successful
                  </span>
                </div>
              </Link>

              {/* Row 2 */}
              <Link href="/payments/pay_FP839185" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                    PS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Priya Sharma</p>
                    <p className="text-[10px] font-mono text-gray-400">pay_M8x2xL1</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹12,250.00</p>
                  <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                    Failed
                  </span>
                </div>
              </Link>

              {/* Row 3 */}
              <Link href="/payments/pay_FP839198" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                    RT
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Rahul Traders</p>
                    <p className="text-[10px] font-mono text-gray-400">pay_K2xL8m8</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹8,900.00</p>
                  <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Processing
                  </span>
                </div>
              </Link>

              {/* Row 4 */}
              <Link href="/payments/pay_FP839201" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0">
                    MV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Meera Verma</p>
                    <p className="text-[10px] font-mono text-gray-400">pay_X5xL2k9</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹1,200.00</p>
                  <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Successful
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </main>

        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}
