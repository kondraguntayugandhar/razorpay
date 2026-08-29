'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Eye,
  X
} from 'lucide-react';

export default function ApiLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [amountFilter, setAmountFilter] = useState('Any');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [showMoreFiltersDrawer, setShowMoreFiltersDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const logs = [
    {
      id: 'req_FP839201',
      method: 'POST',
      endpoint: '/api/v1/orders',
      status: 201,
      amount: '₹2,499.00',
      latency: '142 ms',
      env: 'LIVE',
      timestamp: '28 Aug 2026 18:42:13',
    },
    {
      id: 'req_FP839200',
      method: 'GET',
      endpoint: '/api/v1/payments/pay_FP839198',
      status: 200,
      amount: '₹12,500.00',
      latency: '48 ms',
      env: 'LIVE',
      timestamp: '28 Aug 2026 18:40:02',
    },
    {
      id: 'req_FP839199',
      method: 'POST',
      endpoint: '/api/v1/payments/pay_FP839185/refund',
      status: 400,
      amount: '₹850.00',
      latency: '210 ms',
      env: 'TEST',
      timestamp: '28 Aug 2026 18:35:50',
    },
    {
      id: 'req_FP839198',
      method: 'DELETE',
      endpoint: '/api/v1/links/plink_2D5E88ZZ',
      status: 200,
      amount: '₹2,499.00',
      latency: '95 ms',
      env: 'TEST',
      timestamp: '28 Aug 2026 18:22:11',
    },
  ];

  const handleCopy = (reqId: string) => {
    navigator.clipboard.writeText(reqId);
    setCopiedId(reqId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Logs</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor API requests, responses and webhook activity.</p>
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Requests Today</span>
          <h2 className="text-2xl font-extrabold text-gray-900">142,850</h2>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Successful</span>
          <h2 className="text-2xl font-extrabold text-emerald-600">142,410</h2>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Failed</span>
          <h2 className="text-2xl font-extrabold text-rose-600">440</h2>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Average Latency</span>
          <h2 className="text-2xl font-extrabold text-blue-600">112 ms</h2>
        </div>
      </div>

      {/* FILTER BAR IN BOX SHAPE */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by request ID, endpoint or event..."
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center space-x-2 text-xs">
            {/* Date Filter Dropdown */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-semibold appearance-none pr-8 focus:outline-none"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Custom Range</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-semibold appearance-none pr-8 focus:outline-none"
              >
                <option value="All">Status: All</option>
                <option value="200">200 Success</option>
                <option value="201">201 Created</option>
                <option value="400">400 Bad Request</option>
                <option value="401">401 Unauthorized</option>
                <option value="500">500 Server Error</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Method Filter Dropdown */}
            <div className="relative">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-semibold appearance-none pr-8 focus:outline-none"
              >
                <option value="All">Method: All</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Amount Filter Dropdown */}
            <div className="relative">
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-semibold appearance-none pr-8 focus:outline-none"
              >
                <option value="Any">Amount: Any</option>
                <option value="500">₹0 – ₹500</option>
                <option value="1000">₹500 – ₹1,000</option>
                <option value="5000">₹1,000 – ₹5,000</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* More Filters Drawer Button */}
            <button
              onClick={() => setShowMoreFiltersDrawer(true)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 font-semibold flex items-center space-x-1 hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* DENSE LOGS TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    <Link href={`/developers/logs/${log.id}`}>{log.id}</Link>
                  </td>
                  <td className="py-3.5 px-4">
                    {log.method === 'POST' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px] font-mono">POST</span>}
                    {log.method === 'GET' && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px] font-mono">GET</span>}
                    {log.method === 'DELETE' && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] font-mono">DELETE</span>}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-800 text-[11px]">{log.endpoint}</td>
                  <td className="py-3.5 px-4">
                    {log.status < 300 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        {log.status}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                        {log.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{log.amount}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{log.latency}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${log.env === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {log.env}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">{log.timestamp}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/developers/logs/${log.id}`} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleCopy(log.id)} className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Copy Request ID">
                        {copiedId === log.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EXACT SPECIFICATION PAGINATION */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 1 to 4 of 1,248 entries</span>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded bg-white font-semibold text-gray-700"
              >
                <option value="4">4</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-400 font-semibold disabled:opacity-40" disabled>
                Previous
              </button>
              <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-2xs">
                1
              </button>
              <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold flex items-center justify-center">
                3
              </button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold flex items-center justify-center">
                312
              </button>
              <button className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MORE FILTERS DRAWER */}
      {showMoreFiltersDrawer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowMoreFiltersDrawer(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Endpoint</label>
                  <input type="text" placeholder="/api/v1/..." className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Environment</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option>All</option>
                    <option>LIVE</option>
                    <option>TEST</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Latency</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option>Any</option>
                    <option>&lt; 100 ms</option>
                    <option>&lt; 500 ms</option>
                    <option>&gt; 1 sec</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 text-xs">
              <button onClick={() => setShowMoreFiltersDrawer(false)} className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600">
                Clear all
              </button>
              <button onClick={() => setShowMoreFiltersDrawer(false)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-xs">
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
