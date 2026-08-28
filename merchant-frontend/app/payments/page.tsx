'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FastPayLogo } from '../../components/FastPayLogo';
import { BottomNav } from '../../components/BottomNav';
import { Bell, Search, Download, Filter, Smartphone, CreditCard, Building2 } from 'lucide-react';

export default function PaymentsListPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 'pay_FP839201',
      customer: 'Rahul Sharma',
      method: 'UPI',
      date: 'Oct 24, 2:30 PM',
      amount: '₹2,499.00',
      status: 'Successful',
      statusColor: 'text-emerald-700 bg-emerald-100',
      icon: <Smartphone className="w-3.5 h-3.5 text-blue-600" />
    },
    {
      id: 'pay_FP839198',
      customer: 'Priya Patel',
      method: 'Card',
      date: 'Oct 24, 1:15 PM',
      amount: '₹12,500.00',
      status: 'Pending',
      statusColor: 'text-amber-700 bg-amber-100',
      icon: <CreditCard className="w-3.5 h-3.5 text-purple-600" />
    },
    {
      id: 'pay_FP839185',
      customer: 'Amit Singh',
      method: 'Netbanking',
      date: 'Oct 24, 10:45 AM',
      amount: '₹850.00',
      status: 'Failed',
      statusColor: 'text-rose-700 bg-rose-100',
      icon: <Building2 className="w-3.5 h-3.5 text-orange-600" />
    }
  ];

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
          {/* TITLE */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage and track your transactions</p>
          </div>

          {/* ACTION BUTTONS ROW */}
          <div className="flex items-center space-x-2">
            <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white flex items-center space-x-1.5 shadow-2xs hover:bg-gray-50">
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export</span>
            </button>
            <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white flex items-center space-x-1.5 shadow-2xs hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Filter</span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payment ID, order ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* TRANSACTION CARDS LIST */}
          <div className="space-y-3 pt-1">
            {transactions.map((tx) => (
              <Link
                key={tx.id}
                href={`/payments/${tx.id}`}
                className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs block hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="font-mono text-xs font-bold text-gray-900">{tx.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tx.statusColor}`}>
                    {tx.status}
                  </span>
                </div>

                <div className="pt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Customer</span>
                    <span className="font-bold text-gray-900">{tx.customer}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Method</span>
                    <span className="font-medium text-gray-800 flex items-center space-x-1">
                      {tx.icon}
                      <span>{tx.method}</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Date</span>
                    <span className="text-gray-600 font-medium">{tx.date}</span>
                  </div>

                  <div className="flex justify-between pt-1 font-bold text-sm">
                    <span className="text-gray-400 text-xs">Amount</span>
                    <span className="text-gray-900">{tx.amount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>

        <BottomNav activeTab="payments" />
      </div>
    </div>
  );
}
