'use client';

import React from 'react';
import Link from 'next/link';
import { FastPayLogo } from '../../components/FastPayLogo';
import { BottomNav } from '../../components/BottomNav';
import { Bell, Download, Building2, Calendar, TrendingUp } from 'lucide-react';

export default function SettlementsPage() {
  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-2 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col pb-16 min-h-[672px]">


        {/* HEADER */}
        <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-bold text-lg cursor-pointer">≡</span>
            <FastPayLogo size="md" />
          </div>
          <button className="relative text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <main className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* TITLE & DOWNLOAD */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Settlements</h1>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>

          {/* AVAILABLE BALANCE CARD */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Available Balance</p>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹8,42,390</h2>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+2.4% vs last week</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* NEXT SETTLEMENT CARD */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Next Settlement</p>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹4,28,320</h2>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Scheduled for 29 Aug 2026</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* SETTLEMENT HISTORY */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">Settlement History</span>
              <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </a>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Row 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <div>
                  <p className="text-xs font-mono font-bold text-gray-900">ST-10928</p>
                  <p className="text-[10px] text-gray-400">28 Aug 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹1,20,000</p>
                  <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                    PROCESSED
                  </span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <div>
                  <p className="text-xs font-mono font-bold text-gray-900">ST-10927</p>
                  <p className="text-[10px] text-gray-400">27 Aug 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹45,500</p>
                  <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                    PROCESSED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <BottomNav activeTab="orders" />
      </div>
    </div>
  );
}
