'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isTestMode, setIsTestMode] = useState(false);

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* GLOBAL SEARCH */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search payments, orders, customers (Press '/' to focus)"
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
        />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center space-x-4">
        {/* Live / Test Mode Toggle */}
        <div className="bg-gray-100 p-0.5 rounded-xl flex items-center text-xs font-bold border border-gray-200">
          <button
            onClick={() => setIsTestMode(false)}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isTestMode ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setIsTestMode(true)}
            className={`px-3 py-1 rounded-lg transition-all ${
              isTestMode ? 'bg-amber-500 text-white shadow-2xs font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Test Mode
          </button>
        </div>

        {/* Quick Create Link Button */}
        <Link
          href="/links/create"
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payment Link</span>
        </Link>

        {/* Notifications */}
        <Link href="/notifications" className="relative text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
        </Link>
      </div>
    </header>
  );
};
