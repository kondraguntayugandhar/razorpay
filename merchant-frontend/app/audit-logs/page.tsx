'use client';

import React from 'react';
import { History, ShieldCheck } from 'lucide-react';

export default function AuditLogsPage() {
  const logs = [
    { action: 'API Key Generated', user: 'Arjun M (Owner)', ip: '49.207.214.102', timestamp: 'Oct 24, 2026, 16:20 IST' },
    { action: 'Refund Processed (ref_FP77102)', user: 'Kavya Ramesh (Finance)', ip: '49.207.214.105', timestamp: 'Oct 24, 2026, 15:10 IST' },
    { action: 'Dispute Evidence Submitted', user: 'Siddharth V (Developer)', ip: '49.207.214.108', timestamp: 'Oct 24, 2026, 12:45 IST' },
    { action: 'Webhook Endpoint Updated', user: 'Arjun M (Owner)', ip: '49.207.214.102', timestamp: 'Oct 24, 2026, 10:15 IST' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-xs text-gray-500 mt-1">Immutable security activity log of all merchant team actions and API changes</p>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Action Description</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {logs.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center space-x-2">
                    <History className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{l.action}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-bold">{l.user}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{l.ip}</td>
                  <td className="py-3.5 px-4 text-gray-500">{l.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
