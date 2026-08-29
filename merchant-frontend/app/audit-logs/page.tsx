'use client';

import React, { useEffect, useState } from 'react';
import { Download, ChevronDown, ChevronLeft, ChevronRight, ChevronRightIcon } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function AuditLogsPage() {
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [userFilter, setUserFilter] = useState('All Users');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setLogs(data.data);
        }
      } catch (err) {
        // Fallback default
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1">Track user activity and system events across your organization.</p>
        </div>

        <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs transition-colors">
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Export</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">USER</th>
                <th className="py-3 px-4">ACTION</th>
                <th className="py-3 px-4">RESOURCE</th>
                <th className="py-3 px-4">IP ADDRESS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    Loading live audit log stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    No audit log events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900">{log.user || 'Merchant Owner'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{log.action}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{log.resource}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{log.ip || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <span>●</span>
                        <span>{log.status || 'Success'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRightIcon className="w-4 h-4 text-gray-300" />
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
