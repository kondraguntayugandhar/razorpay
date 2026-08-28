'use client';

import React, { useState } from 'react';
import { Search, Users, Mail, Phone, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';

export default function CustomersPage() {
  const [query, setQuery] = useState('');

  const customers = [
    {
      id: 'cust_FP8812',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 98765 43210',
      totalSpent: '₹42,800.00',
      totalOrders: 8,
      status: 'Active',
      joinedDate: 'Jan 15, 2026',
    },
    {
      id: 'cust_FP8811',
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 98123 45678',
      totalSpent: '₹18,500.00',
      totalOrders: 3,
      status: 'Active',
      joinedDate: 'Feb 20, 2026',
    },
    {
      id: 'cust_FP8810',
      name: 'Amit Singh',
      email: 'amit@example.com',
      phone: '+91 97111 22233',
      totalSpent: '₹850.00',
      totalOrders: 1,
      status: 'New',
      joinedDate: 'Oct 24, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-xs text-gray-500 mt-1">View customer profiles, saved payment tokens, lifetime value, and payment history</p>
        </div>

        <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Users className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Customers</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">12,670</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+18.5% growth</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Repeat Customers</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">74.2%</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">High retention</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Avg Lifetime Value</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹8,920</h2>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">LTV Expansion</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Saved Payment Tokens</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">8,340</h2>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Tokenized cards & VPA</p>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Customer ID, Name, Email, Phone..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{c.id}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{c.phone}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{c.totalOrders}</td>
                  <td className="py-3.5 px-4 font-extrabold text-gray-900">{c.totalSpent}</td>
                  <td className="py-3.5 px-4 text-gray-500">{c.joinedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4" />
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
