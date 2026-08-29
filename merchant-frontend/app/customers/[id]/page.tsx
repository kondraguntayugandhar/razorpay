'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Edit2, ChevronLeft } from 'lucide-react';

export default function CustomerDetailsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'payments' | 'overview' | 'orders' | 'refunds'>('payments');

  const customerTransactions = [
    {
      id: 'pay_NK3xBL0P2q',
      orderId: 'ord_L9P2qNK3x8',
      date: 'Oct 24, 2023, 14:32',
      amount: '₹4,500.00',
      method: 'UPI',
      status: 'Captured',
      statusType: 'success',
    },
    {
      id: 'pay_MK2w7K801p',
      orderId: 'ord_KR07pMK2w7',
      date: 'Sep 12, 2023, 09:15',
      amount: '₹12,800.00',
      method: 'Card **** 4242',
      status: 'Captured',
      statusType: 'success',
    },
    {
      id: 'pay_LJ1v6J7N0o',
      orderId: 'ord_J7N0oLJ1v6',
      date: 'Aug 05, 2023, 18:45',
      amount: '₹1,500.00',
      method: 'Netbanking',
      status: 'Failed',
      statusType: 'failed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* BREADCRUMB & HEADER */}
      <div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium mb-1">
          <button onClick={() => router.push('/customers')} className="hover:underline">Customers</button>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono text-gray-600">cust_FP29381</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rahul Sharma</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              ● Active
            </span>
          </div>
          <button className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs">
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* TOP 2 COLUMN CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT CARD: METRICS (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">TOTAL SPENT</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-0.5">₹42,390</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Total Payments</p>
              <p className="font-bold text-gray-900 text-base mt-0.5">14</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Avg. Order Value</p>
              <p className="font-bold text-gray-900 text-base mt-0.5">₹3,027</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Last Payment</span>
            <span className="font-bold text-gray-900">Oct 24, 2023</span>
          </div>
        </div>

        {/* RIGHT CARD: CONTACT INFORMATION (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 font-medium text-[11px]">Email Address</p>
                <p className="font-bold text-gray-900 mt-0.5">rahul.sharma@example.com</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium text-[11px]">Phone Number</p>
                <p className="font-bold text-gray-900 mt-0.5">+91 98765 43210</p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 font-medium text-[11px]">Billing Address</p>
              <p className="font-medium text-gray-700 leading-relaxed mt-0.5">
                Block A, 4th Floor, Tech Park<br />
                HSR Layout, Sector 2<br />
                Bengaluru, Karnataka 560102<br />
                India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TRANSACTIONS TABLE BOX */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        {/* TABS HEADER */}
        <div className="p-4 border-b border-gray-100 flex items-center space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-1 transition-colors ${
              activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-1 transition-colors ${
              activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-1 transition-colors ${
              activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`pb-1 transition-colors ${
              activeTab === 'refunds' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Refunds
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">PAYMENT ID</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">METHOD</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {customerTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {tx.id}
                    <span className="block text-[10px] text-gray-400 font-normal">{tx.orderId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[11px]">{tx.date}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{tx.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-semibold border border-gray-200">
                      {tx.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {tx.statusType === 'success' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        ● Captured
                      </span>
                    )}
                    {tx.statusType === 'failed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                        ✕ Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 1 to 3 of 14 entries</span>
          <div className="flex items-center space-x-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-2xs">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 font-semibold">
              2
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
