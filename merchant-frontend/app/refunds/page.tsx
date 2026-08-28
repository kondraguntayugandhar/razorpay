'use client';

import React, { useState } from 'react';
import { Search, Download, RotateCcw, Plus } from 'lucide-react';
import { RefundModal } from '../../components/refund-modal/RefundModal';

export default function RefundsPage() {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refunds = [
    {
      id: 'ref_FP77102',
      paymentId: 'pay_FP839201',
      amount: '₹2,499.00',
      reason: 'CUSTOMER_REQUEST',
      status: 'Processed',
      statusColor: 'text-emerald-700 bg-emerald-100',
      date: 'Oct 24, 2026, 15:10 IST',
      customer: 'Rahul Sharma',
      idempotencyKey: 'idem_ref_991823',
    },
    {
      id: 'ref_FP77101',
      paymentId: 'pay_FP839185',
      amount: '₹850.00',
      reason: 'DUPLICATE_PAYMENT',
      status: 'Pending',
      statusColor: 'text-amber-700 bg-amber-100',
      date: 'Oct 24, 2026, 11:30 IST',
      customer: 'Amit Singh',
      idempotencyKey: 'idem_ref_991822',
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds Management</h1>
          <p className="text-xs text-gray-500 mt-1">Issue full or partial refunds with instant bank settlement and idempotency safety</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Refund</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Refunded</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹1,24,500</h2>
          <p className="text-[11px] text-gray-400 font-medium mt-1">Across 42 transactions</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Instant Refunds</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">96.4%</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Settled &lt; 5 mins</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Pending Refunds</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹850.00</h2>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">1 refund processing</p>
        </div>

        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Refund Rate</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">0.45%</h2>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Healthy merchant score</p>
        </div>
      </div>

      {/* REFUNDS TABLE */}
      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Refund ID, Payment ID, Idempotency Key..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Refund ID</th>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Idempotency Key</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {refunds.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{r.id}</td>
                  <td className="py-3.5 px-4 font-mono text-blue-600">{r.paymentId}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{r.customer}</td>
                  <td className="py-3.5 px-4 text-gray-600">{r.reason}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{r.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r.statusColor}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">{r.idempotencyKey}</td>
                  <td className="py-3.5 px-4 text-gray-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFUND MODAL */}
      <RefundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefundCreated={() => setIsModalOpen(false)}
        paymentId="pay_FP839201"
        originalAmountPaise={249900}
      />

    </div>
  );
}
