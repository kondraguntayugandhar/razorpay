'use client';

import React from 'react';
import { FileText, Plus, Download } from 'lucide-react';

export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2026-009', customer: 'Rahul Sharma', amount: '₹14,500.00', status: 'Paid', statusColor: 'text-emerald-700 bg-emerald-100', dueDate: 'Oct 28, 2026' },
    { id: 'INV-2026-008', customer: 'Priya Patel', amount: '₹22,300.00', status: 'Unpaid', statusColor: 'text-amber-700 bg-amber-100', dueDate: 'Nov 05, 2026' },
    { id: 'INV-2026-007', customer: 'Amit Singh', amount: '₹3,500.00', status: 'Overdue', statusColor: 'text-rose-700 bg-rose-100', dueDate: 'Oct 15, 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-xs text-gray-500 mt-1">Create GST-compliant invoices with automatic tax calculation and payment links</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Invoiced</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹1,24,500</h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Paid Invoices</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹82,300</h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Pending Unpaid</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹37,700</h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Overdue Invoices</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">₹4,500</h2>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{inv.id}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{inv.customer}</td>
                  <td className="py-3.5 px-4 font-extrabold text-gray-900">{inv.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${inv.statusColor}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
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
