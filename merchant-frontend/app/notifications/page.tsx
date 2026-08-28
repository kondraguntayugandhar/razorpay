'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    { title: 'Daily Settlement Processed', desc: '₹1,20,000 has been credited to your HDFC bank account (UTR: UTR998182371).', time: '10 mins ago', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
    { title: 'Dispute Action Required', desc: 'A new dispute (disp_FP99812) has been filed for ₹850. Submit evidence before Oct 26.', time: '2 hours ago', icon: <AlertTriangle className="w-4 h-4 text-rose-600" /> },
    { title: 'Webhooks High Success Rate', desc: '14,280 webhook payloads delivered with 99.9% success rate today.', time: '5 hours ago', icon: <ShieldCheck className="w-4 h-4 text-blue-600" /> },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time alerts for bank payouts, webhooks, chargebacks, and security updates</p>
        </div>

        <button className="text-xs text-blue-600 font-bold hover:underline">Mark all as read</button>
      </div>

      <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 flex items-start space-x-3 hover:bg-white transition-colors">
            <div className="mt-0.5 shrink-0">{n.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-xs text-gray-900">{n.title}</p>
                <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
