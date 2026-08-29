'use client';

import React, { useEffect, useState } from 'react';
import { Download, Building2, Calendar, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettlements() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/settlements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setSettlements(data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchSettlements();
  }, []);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settlements</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor daily payout schedules, bank deposits, and UTR references.</p>
        </div>

        <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs transition-colors">
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Download Report</span>
        </button>
      </div>

      {/* STAT CARDS IN BOX SHAPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Balance</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
              ₹{settlements.length > 0 ? ((settlements[0].netAmount || 487964) / 100).toFixed(2) : '4,879.64'}
            </h2>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Calculated net after 2% + ₹2 fee & 18% GST</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Next Settlement</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Scheduled</h2>
            <p className="text-xs text-gray-500 font-medium mt-2">Auto-payout daily at midnight</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SETTLEMENT HISTORY TABLE BOX CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900">Settlement History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">SETTLEMENT ID</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">GROSS AMOUNT</th>
                <th className="py-3 px-4">FEES + GST</th>
                <th className="py-3 px-4">NET PAYOUT</th>
                <th className="py-3 px-4">UTR NUMBER</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    Calculating derived settlement payouts...
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    No processed settlements recorded.
                  </td>
                </tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{s.id}</td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">{s.date}</td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">₹{(s.grossAmount / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">-₹{(((s.fees || 0) + (s.gst || 0)) / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹{(s.netAmount / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{s.utr}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        {s.status}
                      </span>
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
