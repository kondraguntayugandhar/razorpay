'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, ArrowLeft, Copy, Check, RefreshCw, Download } from 'lucide-react';

export default function LogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = (params?.requestId as string) || 'req_FP839201';
  const [copied, setCopied] = useState(false);

  const requestBody = {
    amount: 249900,
    currency: 'INR',
    order_id: 'order_FP839201',
    customer: {
      name: 'Rahul Jain',
      email: 'rahul@example.com'
    },
    method: 'upi'
  };

  const responseBody = {
    id: 'pay_FP839201',
    entity: 'payment',
    amount: 249900,
    currency: 'INR',
    status: 'captured',
    order_id: 'order_FP839201',
    created_at: 1787944933
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ request: requestBody, response: responseBody }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* BREADCRUMB & HEADER */}
      <div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium mb-1">
          <button onClick={() => router.push('/developers/logs')} className="hover:underline">API Logs</button>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono text-gray-600">{requestId}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-xs font-mono">POST</span>
                <h1 className="text-xl font-bold font-mono text-gray-900">{requestId}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  201 Created
                </span>
              </div>
              <p className="text-xs font-mono text-gray-500 mt-0.5">/api/v1/orders • 142 ms • LIVE</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={handleCopyJson} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>

      {/* REQUEST HEADERS (MASKED SECRETS) */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-2">Request Headers (Masked)</h3>
        <div className="bg-gray-900 text-gray-200 p-4 rounded-lg font-mono text-xs space-y-1">
          <p><span className="text-purple-400">Authorization</span>: Bearer fp_live_••••••••••••••••</p>
          <p><span className="text-purple-400">Content-Type</span>: application/json</p>
          <p><span className="text-purple-400">User-Agent</span>: FastPay-Node/v2.4</p>
        </div>
      </div>

      {/* REQUEST BODY JSON */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-2">Request Body</h3>
        <pre className="bg-gray-900 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          {JSON.stringify(requestBody, null, 2)}
        </pre>
      </div>

      {/* RESPONSE BODY JSON */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-2">Response Body (201 Created)</h3>
        <pre className="bg-gray-900 text-blue-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          {JSON.stringify(responseBody, null, 2)}
        </pre>
      </div>
    </div>
  );
}
