'use client';

import React from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Reconciliation</h1>
          <p className="text-xs text-gray-500 mt-1">Generate automated GST reports, settlement breakups, and bank reconciliation files</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Download className="w-4 h-4" />
          <span>Export All Reports (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-900">Settlement Report</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500">Daily bank payout credit breakup with UTR transaction codes</p>
          <button className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors">
            Download Settlement CSV
          </button>
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-900">GST & Tax Summary</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500">Monthly MDR fee breakdown with 18% GST tax invoices</p>
          <button className="w-full py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors">
            Download Tax Report
          </button>
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-900">Dispute & Chargeback Log</span>
            <BarChart3 className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-xs text-gray-500">Audited list of disputed transactions and evidence files</p>
          <button className="w-full py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors">
            Download Dispute Log
          </button>
        </div>
      </div>
    </div>
  );
}
