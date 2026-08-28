'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Download, Filter, ShoppingBag, Eye, ArrowUpRight } from 'lucide-react';

export default function OrdersPage() {
  const [query, setQuery] = useState('');

  const orders = [
    {
      id: 'order_FP102938',
      receipt: 'rcpt_1001',
      customer: 'Rahul Sharma',
      amount: '₹7,000.00',
      status: 'Paid',
      statusColor: 'text-emerald-700 bg-emerald-100',
      date: 'Oct 24, 2026, 14:32 IST',
      items: '2 Items (Electronics)',
    },
    {
      id: 'order_FP102937',
      receipt: 'rcpt_1002',
      customer: 'Priya Patel',
      amount: '₹12,500.00',
      status: 'Attempted',
      statusColor: 'text-amber-700 bg-amber-100',
      date: 'Oct 24, 2026, 13:15 IST',
      items: '1 Item (Fashion)',
    },
    {
      id: 'order_FP102936',
      receipt: 'rcpt_1003',
      customer: 'Amit Singh',
      amount: '₹850.00',
      status: 'Created',
      statusColor: 'text-blue-700 bg-blue-100',
      date: 'Oct 24, 2026, 11:20 IST',
      items: '3 Items (Grocery)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-1">Track customer order receipts, payments, and full line item details</p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white flex items-center space-x-1.5 shadow-2xs hover:bg-gray-50">
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Orders</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">1,428</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+14.2% this month</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Paid Orders</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">1,310</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">91.7% Conversion</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Pending Orders</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">86</h2>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">6.0% Pending</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Average Order Value</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹3,450</h2>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">AOV Growth</p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Order ID, Receipt ID, Customer Name..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white flex items-center space-x-1.5 shadow-2xs hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span>Filter Status</span>
          </button>
        </div>

        {/* ORDERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{ord.id}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">{ord.receipt}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{ord.customer}</td>
                  <td className="py-3.5 px-4 text-gray-600">{ord.items}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{ord.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ord.statusColor}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{ord.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/payments/pay_FP839201`}
                      className="p-1.5 inline-flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
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
