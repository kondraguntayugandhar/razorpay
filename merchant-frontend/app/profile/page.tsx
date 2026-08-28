'use client';

import React from 'react';
import { User, ShieldCheck, Mail, Building2, Key } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your merchant account settings, business KYC, and 2FA credentials</p>
      </div>

      <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-2xs space-y-6">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            AM
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Arjun M</h2>
            <p className="text-xs text-gray-500">Merchant Account Owner • Acme Store Pvt Ltd</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              KYC VERIFIED
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-500 font-medium mb-1">Email Address</label>
            <input type="text" value="arjun@fastpay.com" readOnly className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800" />
          </div>

          <div>
            <label className="block text-gray-500 font-medium mb-1">Registered Legal Entity</label>
            <input type="text" value="Acme Store Private Limited (CIN: U72900KA2026PTC123456)" readOnly className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800" />
          </div>

          <div>
            <label className="block text-gray-500 font-medium mb-1">GSTIN Number</label>
            <input type="text" value="29AAAAA0000A1Z5" readOnly className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
