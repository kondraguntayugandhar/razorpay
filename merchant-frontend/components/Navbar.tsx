'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, HelpCircle, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isTestMode, setIsTestMode] = useState(true);

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* GLOBAL SEARCH BOX */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search payments, customers, refunds..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
        />
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center space-x-5">
        {/* Test Mode Toggle Switch matching screenshot */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-600">Test Mode</span>
          <button
            onClick={() => setIsTestMode(!isTestMode)}
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
              isTestMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                isTestMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Help icon (?) */}
        <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </Link>

        {/* Profile Avatar */}
        <Link href="/profile" className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-gray-100 hover:ring-blue-500 transition-all overflow-hidden">
            <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-full h-full flex items-center justify-center text-white">
              AM
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

