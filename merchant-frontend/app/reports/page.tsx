'use client';

import React, { useState } from 'react';
import {
  Download,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

export default function ReportsReconciliationPage() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const reconRows = [
    { date: 'Oct 28, 2023', type: 'Settlement', amount: '₹1,245,000', status: 'Matched', statusType: 'success', bankRef: 'BK-1A8712' },
    { date: 'Oct 27, 2023', type: 'Refund Batch', amount: '- ₹12,500', status: 'Unmatched', statusType: 'warning', bankRef: '--' },
    { date: 'Oct 26, 2023', type: 'Settlement', amount: '₹982,500', status: 'Matched', statusType: 'success', bankRef: 'BK-1A8259' },
    { date: 'Oct 25, 2023', type: 'Chargeback', amount: '- ₹4,500', status: 'Reconciled', statusType: 'danger', bankRef: 'CB-1025' },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reconciliation & GST</h1>
          <p className="text-xs text-gray-500 mt-1">Financial summary for current billing cycle.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Oct 1 - Oct 31, 2023</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* TOP ROW GRID (Left 8 cols: Net Settlement Summary, Right 4 cols: Tax Summary GST) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT CARD: NET SETTLEMENT SUMMARY (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Net Settlement Summary</h3>
            <button className="text-xs font-semibold text-blue-600 hover:underline">View details</button>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gross Processing Volume</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5">₹4,250,000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Deductions</p>
              <p className="text-xl font-extrabold text-rose-600 mt-0.5">- ₹85,500</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Net Settled Amount</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">₹4,164,500</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Payments Processed</span>
              </span>
              <span className="font-bold text-gray-900">₹4,250,000</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Refunds Issued</span>
              </span>
              <span className="font-bold text-rose-600">- ₹45,000</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Gateway Fees</span>
              </span>
              <span className="font-bold text-rose-600">- ₹34,322</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>GST on Fees (18%)</span>
              </span>
              <span className="font-bold text-rose-600">- ₹6,178</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Manual Adjustments</span>
              </span>
              <span className="font-bold text-gray-900">₹0</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: TAX SUMMARY GST (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-base">🏛️</span>
              <h3 className="font-bold text-sm text-gray-900">Tax Summary (GST)</h3>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Taxable Volume</p>
              <p className="text-lg font-extrabold text-gray-900 mt-0.5">₹4,250,000</p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Gateway Fees</p>
              <p className="text-lg font-extrabold text-gray-900 mt-0.5">₹34,322.00</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">GST Collected (18% on Fees)</p>
                <Info className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-xl font-extrabold text-blue-900 mt-0.5">₹6,177.96</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button className="w-full py-2 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors shadow-2xs">
              Download GST Report
            </button>
            <p className="text-[10px] text-gray-400 text-center">B2B Invoice ready for ITC claim</p>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW GRID (Left 8 cols: Reconciliation Match Status, Right 4 cols: Action Required) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT TABLE: RECONCILIATION MATCH STATUS (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Reconciliation Match Status</h3>
            <button className="px-3 py-1 border border-gray-200 rounded-lg bg-white text-xs font-semibold text-gray-700 flex items-center space-x-1 hover:bg-gray-50">
              <span>{statusFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Txn Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bank Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {reconRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-600">{r.date}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{r.type}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{r.amount}</td>
                    <td className="py-3.5 px-4">
                      {r.statusType === 'success' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                          Matched
                        </span>
                      )}
                      {r.statusType === 'warning' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                          Unmatched
                        </span>
                      )}
                      {r.statusType === 'danger' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                          Reconciled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{r.bankRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Rows per page: 10</span>
            <div className="flex items-center space-x-3">
              <span>1-4 of 42</span>
              <div className="flex items-center space-x-1">
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: ACTION REQUIRED (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Action Required</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              You have 1 reconciliation exception that requires manual review to ensure accurate ledger balancing.
            </p>
          </div>

          <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2 text-xs text-red-900">
            <div className="flex items-center space-x-1.5 font-bold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Chargeback Mismatch</span>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed">
              Amount ₹4,500 on Oct 25 does not match bank ref CB-1025.
            </p>
            <a href="/disputes" className="text-xs font-bold text-red-700 hover:underline inline-block pt-1">
              Review Exception →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
