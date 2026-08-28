'use client';

import React, { useState } from 'react';
import { Key, Plus, Copy, Check, ShieldAlert } from 'lucide-react';

export default function ApiKeysPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const keys = [
    { name: 'Production Live Key', key: 'rzp_live_991823712837192', created: 'Jan 10, 2026', mode: 'Live', modeColor: 'text-emerald-700 bg-emerald-100' },
    { name: 'Sandbox Test Key', key: 'rzp_test_acme_key_001', created: 'Oct 01, 2026', mode: 'Test', modeColor: 'text-amber-700 bg-amber-100' },
  ];

  const handleCopy = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys & Authentication</h1>
          <p className="text-xs text-gray-500 mt-1">Manage API keys for server-side REST integration and web checkout authorization</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      <div className="p-4 border border-amber-200 bg-amber-50/60 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Keep your secret keys secure!</p>
          <p className="mt-0.5 text-amber-800">
            Never commit secret API keys to public repositories or client-side JavaScript. Store them in encrypted environment variables.
          </p>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-4">
        <h3 className="font-bold text-xs text-gray-900">Active Merchant API Keys</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Key Name</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">API Key ID</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Copy Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {keys.map((k) => (
                <tr key={k.key} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{k.name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${k.modeColor}`}>
                      {k.mode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-800 text-[11px]">{k.key}</td>
                  <td className="py-3.5 px-4 text-gray-500">{k.created}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleCopy(k.key)}
                      className="px-2.5 py-1 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center space-x-1 ml-auto"
                    >
                      {copiedKey === k.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === k.key ? 'Copied' : 'Copy'}</span>
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
