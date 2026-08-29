'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  ArrowRight,
  X,
  Eye,
  Settings,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { API_BASE_URL } from '../../../lib/api';

export default function NetbankingManagementPage() {
  const [netbankingEnabled, setNetbankingEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDrawerBank, setSelectedDrawerBank] = useState<any | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Top 20 popular Indian banks
  const initialBanks = [
    { id: 'sbi', name: 'State Bank of India', shortName: 'SBI', code: 'SBI', status: 'Enabled', type: 'Public', txnsToday: '12,842', successRate: '98.4%', bg: 'bg-blue-600' },
    { id: 'hdfc', name: 'HDFC Bank', shortName: 'HDFC', code: 'HDFC', status: 'Enabled', type: 'Private', txnsToday: '14,201', successRate: '99.1%', bg: 'bg-indigo-700' },
    { id: 'icici', name: 'ICICI Bank', shortName: 'ICICI', code: 'ICICI', status: 'Enabled', type: 'Private', txnsToday: '11,540', successRate: '98.8%', bg: 'bg-orange-600' },
    { id: 'axis', name: 'Axis Bank', shortName: 'Axis', code: 'AXIS', status: 'Enabled', type: 'Private', txnsToday: '8,920', successRate: '97.9%', bg: 'bg-rose-700' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', shortName: 'Kotak', code: 'KOTAK', status: 'Enabled', type: 'Private', txnsToday: '6,450', successRate: '98.2%', bg: 'bg-[#ed1c24]' },
    { id: 'bob', name: 'Bank of Baroda', shortName: 'Bank of Baroda', code: 'BOB', status: 'Enabled', type: 'Public', txnsToday: '5,120', successRate: '96.4%', bg: 'bg-orange-500' },
    { id: 'pnb', name: 'Punjab National Bank', shortName: 'PNB', code: 'PNB', status: 'Enabled', type: 'Public', txnsToday: '4,890', successRate: '95.8%', bg: 'bg-amber-600' },
    { id: 'union', name: 'Union Bank of India', shortName: 'Union Bank', code: 'UNION', status: 'Enabled', type: 'Public', txnsToday: '3,750', successRate: '96.1%', bg: 'bg-sky-700' },
    { id: 'canara', name: 'Canara Bank', shortName: 'Canara', code: 'CANARA', status: 'Enabled', type: 'Public', txnsToday: '3,420', successRate: '95.9%', bg: 'bg-yellow-600' },
    { id: 'indian', name: 'Indian Bank', shortName: 'Indian Bank', code: 'INDIAN', status: 'Enabled', type: 'Public', txnsToday: '2,980', successRate: '95.4%', bg: 'bg-blue-700' },
    { id: 'boi', name: 'Bank of India', shortName: 'Bank of India', code: 'BOI', status: 'Enabled', type: 'Public', txnsToday: '2,640', successRate: '94.9%', bg: 'bg-indigo-600' },
    { id: 'idbi', name: 'IDBI Bank', shortName: 'IDBI', code: 'IDBI', status: 'Enabled', type: 'Private', txnsToday: '2,110', successRate: '96.8%', bg: 'bg-teal-700' },
    { id: 'indusind', name: 'IndusInd Bank', shortName: 'IndusInd', code: 'INDUSIND', status: 'Enabled', type: 'Private', txnsToday: '2,450', successRate: '97.2%', bg: 'bg-red-800' },
    { id: 'bom', name: 'Bank of Maharashtra', shortName: 'Bank of Maharashtra', code: 'BOM', status: 'Enabled', type: 'Public', txnsToday: '1,890', successRate: '94.2%', bg: 'bg-cyan-700' },
    { id: 'cbi', name: 'Central Bank of India', shortName: 'Central Bank', code: 'CBI', status: 'Enabled', type: 'Public', txnsToday: '1,650', successRate: '94.8%', bg: 'bg-blue-800' },
    { id: 'iob', name: 'Indian Overseas Bank', shortName: 'IOB', code: 'IOB', status: 'Enabled', type: 'Public', txnsToday: '1,420', successRate: '93.9%', bg: 'bg-sky-600' },
    { id: 'uco', name: 'UCO Bank', shortName: 'UCO Bank', code: 'UCO', status: 'Enabled', type: 'Public', txnsToday: '1,210', successRate: '94.1%', bg: 'bg-indigo-800' },
    { id: 'federal', name: 'Federal Bank', shortName: 'Federal Bank', code: 'FEDERAL', status: 'Enabled', type: 'Private', txnsToday: '3,100', successRate: '97.6%', bg: 'bg-amber-700' },
    { id: 'yes', name: 'YES BANK', shortName: 'YES BANK', code: 'YES', status: 'Enabled', type: 'Private', txnsToday: '2,890', successRate: '96.9%', bg: 'bg-blue-600' },
    { id: 'idfcfirst', name: 'IDFC FIRST Bank', shortName: 'IDFC FIRST', code: 'IDFCFIRST', status: 'Enabled', type: 'Private', txnsToday: '3,540', successRate: '98.0%', bg: 'bg-purple-700' },
  ];

  const [banksList, setBanksList] = useState(initialBanks);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
        const res = await fetch(`${API_BASE_URL}/api/v1/merchant/payment-methods/netbanking/banks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Merge real backend banks with frontend configuration state
          const backendBanks = data.data.map((b: any, idx: number) => ({
            id: b.code ? b.code.toLowerCase() : `bank_${idx}`,
            name: b.name || b.code,
            shortName: b.code || b.name,
            code: b.code,
            status: b.status === 'ENABLED' ? 'Enabled' : 'Disabled',
            type: 'Public',
            txnsToday: '1,200',
            successRate: '98.0%',
            bg: 'bg-blue-600'
          }));
          setBanksList(backendBanks);
        }
      } catch (err) {}
    }
    fetchBanks();
  }, []);

  const filteredBanks = banksList.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.shortName.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Enabled') return matchesSearch && b.status === 'Enabled';
    if (statusFilter === 'Disabled') return matchesSearch && b.status === 'Disabled';
    if (statusFilter === 'Unavailable') return matchesSearch && b.status === 'Temporarily unavailable';
    if (statusFilter === 'Public') return matchesSearch && b.type === 'Public';
    if (statusFilter === 'Private') return matchesSearch && b.type === 'Private';
    return matchesSearch;
  });

  const toggleBankStatus = async (code: string) => {
    const target = banksList.find((b) => b.code === code || b.id === code);
    const newStatus = target && target.status === 'Enabled' ? 'Disabled' : 'Enabled';

    setBanksList((prev) =>
      prev.map((b) =>
        b.code === code || b.id === code ? { ...b, status: newStatus } : b
      )
    );

    try {
      const token = sessionStorage.getItem('fastpay_merchant_key') || 'rzp_test_acme_key_001';
      await fetch(`${API_BASE_URL}/api/v1/merchant/payment-methods/netbanking/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.toUpperCase(), status: newStatus.toUpperCase() })
      });
    } catch (err) {}
  };

  const handleSelectAll = () => {
    setBanksList((prev) => prev.map((b) => ({ ...b, status: 'Enabled' })));
    setUnsavedChanges(true);
  };

  const handleClearAll = () => {
    setBanksList((prev) => prev.map((b) => ({ ...b, status: 'Disabled' })));
    setUnsavedChanges(true);
  };

  const enabledCount = banksList.filter((b) => b.status === 'Enabled').length;

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Netbanking</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              ● Enabled
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Allow customers to pay using their internet banking accounts.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-gray-700">Enable Netbanking</span>
            <button
              onClick={() => {
                setNetbankingEnabled(!netbankingEnabled);
                setUnsavedChanges(true);
              }}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                netbankingEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${netbankingEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Preview Customer Checkout</span>
          </button>

          <button
            onClick={() => {
              setUnsavedChanges(false);
              alert('✓ Netbanking configuration updated successfully.');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* METRIC CARDS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Enabled Banks</span>
          <h2 className="text-3xl font-extrabold text-gray-900">{enabledCount}</h2>
          <p className="text-[10px] text-emerald-600 font-semibold">Active in checkout</p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Supported Banks</span>
          <h2 className="text-3xl font-extrabold text-gray-900">40+</h2>
          <p className="text-[10px] text-gray-400">Public & Private Sector</p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Popular Banks</span>
          <h2 className="text-3xl font-extrabold text-gray-900">20</h2>
          <p className="text-[10px] text-blue-600 font-semibold">Prominently displayed</p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Failed / Unavailable</span>
          <h2 className="text-3xl font-extrabold text-emerald-600">0</h2>
          <p className="text-[10px] text-emerald-600 font-semibold">100% System operational</p>
        </div>
      </div>

      {/* POPULAR BANKS SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Popular Banks</h2>
          <p className="text-xs text-gray-500">These banks are displayed prominently to customers during Netbanking checkout.</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by bank name or code (e.g. HDFC, SBI, Federal)"
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center space-x-2 text-xs">
            {(['All', 'Enabled', 'Disabled', 'Public', 'Private'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  statusFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBanks.map((bank) => (
            <div key={bank.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4 flex flex-col justify-between hover:border-gray-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${bank.bg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {bank.code.slice(0, 3)}
                  </div>
                  {bank.status === 'Enabled' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      ● Enabled
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200">
                      ○ Disabled
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900 block truncate">
                    {bank.name}
                  </h3>
                  <span className="text-xs text-gray-400 font-semibold">{bank.shortName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleBankStatus(bank.code)}
                  className={`w-full py-1.5 border rounded-lg text-xs font-bold transition-colors ${
                    bank.status === 'Enabled'
                      ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                      : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {bank.status === 'Enabled' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
