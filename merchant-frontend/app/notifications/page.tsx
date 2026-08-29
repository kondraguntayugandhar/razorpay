'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Building2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Payments', 'Settlements', 'Refunds', 'KYC', 'Security'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your alerts and system updates.</p>
        </div>

        <button className="text-xs font-bold text-blue-600 hover:underline">
          Mark all as read
        </button>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === cat
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        {/* Notification 1 */}
        <div className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-600 rounded-r-xl rounded-l-sm shadow-2xs flex items-start space-x-4">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Payment successful: ₹4,999 received</h3>
              <span className="text-[10px] text-gray-400 font-medium">2 mins ago</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Payment from customer_8932 (order_id: #ORD_9932) has been successfully processed and added to your balance.
            </p>
            <div className="pt-1">
              <Link href="/payments" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center space-x-1">
                <span>View Transaction</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Notification 2 */}
        <div className="p-5 bg-white border border-gray-200 border-l-4 border-l-blue-600 rounded-r-xl rounded-l-sm shadow-2xs flex items-start space-x-4">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Settlement processed: ₹3,82,400 deposited</h3>
              <span className="text-[10px] text-gray-400 font-medium">1 hour ago</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your daily settlement for transactions processed on 24 Oct has been initiated to your HDFC Bank account ending in 4432.
            </p>
            <div className="pt-1">
              <Link href="/settlements" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center space-x-1">
                <span>View Settlement</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Notification 3 */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-start space-x-4">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Action Required: KYC Update</h3>
              <span className="text-[10px] text-gray-400 font-medium">Yesterday</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Please update your business PAN card details to avoid interruption in settlements.
            </p>
          </div>
        </div>

        {/* Notification 4 */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-start space-x-4">
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Refund Initiated</h3>
              <span className="text-[10px] text-gray-400 font-medium">Oct 23</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Refund of ₹1,200 for order #ORD-99102 has been successfully initiated to the customer.
            </p>
          </div>
        </div>

        {/* Notification 5 */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-start space-x-4">
          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">New Login Detected</h3>
              <span className="text-[10px] text-gray-400 font-medium">Oct 21</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              A new login was detected from Mumbai, India (IP: 192.168.1.1). If this wasn't you, secure your account immediately.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-2">
        <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
          Load older notifications
        </button>
      </div>
    </div>
  );
}
