'use client';

import React, { useState } from 'react';
import { Webhook, Plus, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function WebhooksPage() {
  const [secret, setSecret] = useState('whsec_fastpay_live_99182391283');

  const webhooks = [
    { event: 'payment.authorized', url: 'https://api.acmestore.com/webhooks/fastpay', status: 'Active', deliveries: '14,280', successRate: '99.9%' },
    { event: 'payment.captured', url: 'https://api.acmestore.com/webhooks/fastpay', status: 'Active', deliveries: '14,110', successRate: '100%' },
    { event: 'refund.processed', url: 'https://api.acmestore.com/webhooks/fastpay', status: 'Active', deliveries: '420', successRate: '98.5%' },
    { event: 'dispute.created', url: 'https://api.acmestore.com/webhooks/fastpay', status: 'Active', deliveries: '12', successRate: '100%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks Management</h1>
          <p className="text-xs text-gray-500 mt-1">Configure signature-verified HMAC webhooks for real-time payment event notifications</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Add Webhook Endpoint</span>
        </button>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-gray-900">Webhook Signing Secret</h3>
        <div className="flex items-center space-x-3">
          <input
            type="password"
            value={secret}
            readOnly
            className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800"
          />
          <button className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50">
            Reveal Secret
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <h3 className="font-bold text-xs text-gray-900">Active Webhook Subscriptions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Endpoint URL</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deliveries</th>
                <th className="py-3 px-4">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {webhooks.map((w) => (
                <tr key={w.event} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{w.event}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-600 text-[11px]">{w.url}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 bg-emerald-100">
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{w.deliveries}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{w.successRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
