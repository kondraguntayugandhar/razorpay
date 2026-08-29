'use client';

import React, { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWebhooks() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/webhooks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setWebhooks(data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchWebhooks();
  }, []);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Webhooks</h1>
          <p className="text-xs text-gray-500 mt-1">Manage endpoints receiving real-time event notifications.</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Add webhook</span>
        </button>
      </div>

      {/* WEBHOOKS TABLE IN BOX SHAPE CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">ENDPOINT</th>
                <th className="py-3 px-4">EVENTS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">LAST DELIVERY</th>
                <th className="py-3 px-4">SUCCESS RATE (24H)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                    Loading live webhooks configuration...
                  </td>
                </tr>
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                    No webhooks configured yet. Click "Add webhook" to register an endpoint.
                  </td>
                </tr>
              ) : (
                webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 font-mono hover:text-blue-600 cursor-pointer">{w.url}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{w.secret}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(w.events || ['payment.captured', 'payment.failed']).map((evt: string) => (
                          <span key={evt} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-mono border border-gray-200">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        ● {w.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {w.lastDelivery || '—'}
                    </td>
                    <td className="py-4 px-4 font-bold text-xs text-gray-900">
                      {w.successRate || '100%'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
