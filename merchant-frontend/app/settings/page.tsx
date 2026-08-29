'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Percent,
  Lock,
  Download,
  Printer,
  Share2,
  Info
} from 'lucide-react';

export default function SettingsPaymentMethodsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'upi' | 'netbanking' | 'wallets' | 'emi'>('upi');
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [displayName, setDisplayName] = useState('FastPay Store');
  const [vpa, setVpa] = useState('fastpay@okaxis');

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Methods</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your supported payment options and configurations.</p>
      </div>

      {/* GRID LAYOUT (Left sub-nav 3 cols, Right content 9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SUB-NAVIGATION (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-1 self-start">
          <button
            onClick={() => setActiveSubTab('cards')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'cards'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span>Cards</span>
          </button>

          <button
            onClick={() => setActiveSubTab('upi')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'upi'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>UPI Configuration</span>
          </button>

          <button
            onClick={() => setActiveSubTab('netbanking')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'netbanking'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-4 h-4 text-gray-400" />
            <span>Netbanking</span>
          </button>

          <button
            onClick={() => setActiveSubTab('wallets')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'wallets'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Wallet className="w-4 h-4 text-gray-400" />
            <span>Wallets</span>
          </button>

          <button
            onClick={() => setActiveSubTab('emi')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'emi'
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Percent className="w-4 h-4 text-gray-400" />
            <span>EMI</span>
          </button>
        </div>

        {/* RIGHT CONTENT AREA (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* BOX CARD 1: UPI STATUS */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-gray-900">UPI Status</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Unified Payments Interface is currently enabled for your merchant account.</p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setUpiEnabled(!upiEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  upiEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    upiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* FORM INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Display Name (Shown to Customers)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Settlement VPA (Virtual Payment Address)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    readOnly
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-700 bg-gray-100 pr-9"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          {/* BOX CARD 2 GRID: DYNAMIC QR API & STATIC STORE QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DYNAMIC QR API */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Dynamic QR API</h3>
                <p className="text-xs text-gray-500 mt-0.5">Generate order-specific QR codes for precise reconciliation.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-center space-y-2 my-2">
                <div className="w-36 h-36 bg-white border border-gray-200 rounded-lg mx-auto p-2 flex items-center justify-center shadow-2xs">
                  {/* SVG Mock QR Code */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
                    <rect x="5" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                    <rect x="15" y="15" width="10" height="10" fill="currentColor" />

                    <rect x="65" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                    <rect x="75" y="15" width="10" height="10" fill="currentColor" />

                    <rect x="5" y="65" width="30" height="30" fill="currentColor" />
                    <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                    <rect x="15" y="75" width="10" height="10" fill="currentColor" />

                    <rect x="45" y="45" width="15" height="15" fill="currentColor" />
                    <rect x="65" y="65" width="15" height="15" fill="currentColor" />
                    <rect x="80" y="80" width="15" height="15" fill="currentColor" />
                    <rect x="45" y="15" width="10" height="25" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Example Order ID: <span className="text-gray-700 font-bold">FP_ORDER_X892K1</span></p>
              </div>

              <a href="/developers/api-keys" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center space-x-1">
                <span>View API docs</span>
                <span>→</span>
              </a>
            </div>

            {/* STATIC STORE QR */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Static Store QR</h3>
                <p className="text-xs text-gray-500 mt-0.5">Permanent QR for over-the-counter or printed materials.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-center space-y-2 my-2">
                <div className="w-36 h-36 bg-white border border-gray-200 rounded-lg mx-auto p-2 flex items-center justify-center shadow-2xs">
                  {/* SVG Mock QR Code */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
                    <rect x="5" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                    <rect x="15" y="15" width="10" height="10" fill="currentColor" />

                    <rect x="65" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                    <rect x="75" y="15" width="10" height="10" fill="currentColor" />

                    <rect x="5" y="65" width="30" height="30" fill="currentColor" />
                    <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                    <rect x="15" y="75" width="10" height="10" fill="currentColor" />

                    <rect x="40" y="40" width="25" height="25" fill="currentColor" />
                    <rect x="70" y="45" width="20" height="10" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-900">FastPay Store</p>
                <p className="text-[10px] text-gray-400">Scan to pay any amount</p>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center space-x-1">
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Download</span>
                </button>
                <button className="p-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50">
                  <Printer className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* BOX CARD 3: UPI LIMITS & SETTLEMENTS */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-900 shadow-2xs">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-blue-900">UPI Limits & Settlements</p>
              <p className="text-blue-800 leading-relaxed">
                Standard UPI transaction limits apply (₹1 Lakh per transaction for standard categories). Settlements for UPI transactions are processed instantly in Live mode, but may take T+1 in certain edge cases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
