'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, ArrowLeft, CheckCircle2, TrendingUp, Clock, ShieldCheck } from 'lucide-react';

export default function BankDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bankId = (params?.bankId as string) || 'hdfc';

  const bankDetailsMap: Record<string, any> = {
    hdfc: { name: 'HDFC Bank', shortName: 'HDFC', code: 'HDFC', type: 'Private Sector Bank', status: 'Enabled', txnsToday: '12,842', successful: '12,401', failed: '441', successRate: '96.56%', avgTime: '18.4 seconds' },
    sbi: { name: 'State Bank of India', shortName: 'SBI', code: 'SBI', type: 'Public Sector Bank', status: 'Enabled', txnsToday: '14,500', successful: '14,110', failed: '390', successRate: '97.31%', avgTime: '19.2 seconds' },
  };

  const bank = bankDetailsMap[bankId] || {
    name: `${bankId.toUpperCase()} Bank`,
    shortName: bankId.toUpperCase(),
    code: bankId.toUpperCase(),
    type: 'Scheduled Commercial Bank',
    status: 'Enabled',
    txnsToday: '12,842',
    successful: '12,401',
    failed: '441',
    successRate: '96.56%',
    avgTime: '18.4 seconds'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* BREADCRUMB & HEADER */}
      <div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium mb-1">
          <button onClick={() => router.push('/payment-methods/netbanking')} className="hover:underline">Netbanking</button>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono text-gray-600">{bank.code}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{bank.name}</h1>
              <p className="text-xs text-gray-400 font-mono">Code: {bank.code} • {bank.type}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            ● {bank.status}
          </span>
        </div>
      </div>

      {/* SAMPLE DATA WARNING BANNER */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
        <span>ⓘ Displaying real-time bank performance & transaction statistics. <b>(Sample data)</b></span>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Transactions Today</span>
          <h2 className="text-2xl font-extrabold text-gray-900">{bank.txnsToday}</h2>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Successful</span>
          <h2 className="text-2xl font-extrabold text-emerald-600">{bank.successful}</h2>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Failed</span>
          <h2 className="text-2xl font-extrabold text-rose-600">{bank.failed}</h2>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Success Rate</span>
          <h2 className="text-2xl font-extrabold text-blue-600">{bank.successRate}</h2>
        </div>
      </div>

      {/* PERFORMANCE & TIMINGS */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">Bank Performance Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
            <span className="text-gray-400 font-medium">Average Processing Time</span>
            <p className="text-xl font-bold text-gray-900">{bank.avgTime}</p>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
            <span className="text-gray-400 font-medium">System Uptime (Last 30 Days)</span>
            <p className="text-xl font-bold text-emerald-600">99.98%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
