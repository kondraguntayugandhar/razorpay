'use client';

import React, { useState } from 'react';
import { RefreshCcw, CheckCircle2, AlertTriangle, ShieldCheck, Clock, FileCheck } from 'lucide-react';

export default function ReconciliationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTriggerReconciliation = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/reconciliation/run', {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (e) {
      console.error('Failed to run reconciliation', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Financial Integrity Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Payment Reconciliation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Automated verification comparing FastPay ledger states against upstream bank and PSP transaction logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerReconciliation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Run Manual Reconciliation
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Scheduler Interval</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">Every 30 Seconds</div>
          <p className="text-[11px] text-gray-400 mt-1">Background daemon active in Spring Boot runtime</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Stuck Timeout Threshold</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">2 Minutes Cutoff</div>
          <p className="text-[11px] text-gray-400 mt-1">Checks PROCESSING, PENDING, and UNKNOWN payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Audit Guarantee</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-2">Zero Duplicate Debits</div>
          <p className="text-[11px] text-gray-400 mt-1">Safe inquiry executed prior to retries or closure</p>
        </div>
      </div>

      {/* RUN RESULTS BANNER */}
      {result && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Reconciliation Batch Completed
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-[11px] text-gray-400 font-semibold uppercase">Payments Inspected</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{result.checked}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-[11px] text-gray-400 font-semibold uppercase">Resolved & Updated</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">{result.updated}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-[11px] text-gray-400 font-semibold uppercase">State Mismatches</div>
              <div className="text-xl font-bold text-blue-600 mt-1">{result.mismatches}</div>
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW GUIDE */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900">How Reconciliation Operates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="font-bold text-gray-900 mb-1">1. Polling Stuck States</div>
            <p>Queries database for payments with status PROCESSING, PENDING, or UNKNOWN older than the cutoff threshold.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="font-bold text-gray-900 mb-1">2. Upstream Verification</div>
            <p>Calls the provider's GET /payments/{'{id}'} endpoint to verify whether the customer account was actually debited.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="font-bold text-gray-900 mb-1">3. State Machine Sync</div>
            <p>If provider is SUCCESS, FastPay state transitions UNKNOWN → SUCCESS and marks the Order PAID with an audit event.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
