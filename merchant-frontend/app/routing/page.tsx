'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Shield, ArrowRight, Plus, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

interface RoutingRule {
  id: string;
  name: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  targetProvider: string;
  priority: number;
  weight: number;
  isActive: boolean;
}

export default function RoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    paymentMethod: 'ALL',
    minAmount: 0,
    maxAmount: 10000000,
    targetProvider: 'PSP_A',
    priority: 1,
    weight: 100,
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/routing/rules');
      const json = await res.json();
      if (json.success && json.data) {
        setRules(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch routing rules', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newRule.name,
        paymentMethod: newRule.paymentMethod === 'ALL' ? null : newRule.paymentMethod,
        minAmount: Number(newRule.minAmount),
        maxAmount: Number(newRule.maxAmount),
        targetProvider: newRule.targetProvider,
        priority: Number(newRule.priority),
        weight: Number(newRule.weight),
        isActive: true,
      };

      const res = await fetch('http://localhost:8080/api/v1/routing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewRule({
          name: '',
          paymentMethod: 'ALL',
          minAmount: 0,
          maxAmount: 10000000,
          targetProvider: 'PSP_A',
          priority: 1,
          weight: 100,
        });
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to create rule', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" /> FastPay 2.0 Orchestrator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Smart Payment Routing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure weighted scoring algorithms, volume-based conditions, and provider priority rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRules}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Routing Rule
          </button>
        </div>
      </div>

      {/* ALGORITHM SCORING EXPLANATION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Success Rate Weight</span>
            <span className="font-bold text-blue-600">40%</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[40%]" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Prioritizes providers with lowest failure rates</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Latency Weight</span>
            <span className="font-bold text-emerald-600">25%</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full w-[25%]" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Favors sub-300ms fast gateway hops</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Cost Optimization</span>
            <span className="font-bold text-amber-600">15%</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-[15%]" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Minimizes interchange and base MDR fees</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Merchant Priority</span>
            <span className="font-bold text-purple-600">20%</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full w-[20%]" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Explicit merchant configuration bonus</p>
        </div>
      </div>

      {/* ACTIVE RULES TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Active Orchestration Rules ({rules.length})
          </h2>
          <span className="text-xs text-gray-500">Evaluated in descending priority order</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-5">Rule Name</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Amount Range</th>
                <th className="py-3.5 px-5">Target Provider</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Weight Bonus</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                    No custom routing rules defined. Using default multi-factor scoring engine.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5 font-semibold text-gray-900">{rule.name}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {rule.paymentMethod || 'ANY'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-500">
                      ₹{((rule.minAmount || 0) / 100).toLocaleString()} – ₹{((rule.maxAmount || 10000000) / 100).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-blue-600">
                      {rule.targetProvider}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-medium">{rule.priority}</td>
                    <td className="py-3.5 px-5 text-xs font-bold text-gray-700">+{rule.weight} pts</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE RULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create Routing Rule</h3>
            <p className="text-xs text-gray-500 mb-5">Define conditions to direct transactions to a specific provider.</p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., UPI VIP Fast Routing"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={newRule.paymentMethod}
                    onChange={(e) => setNewRule({ ...newRule, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ALL">ANY Method</option>
                    <option value="UPI">UPI Only</option>
                    <option value="CARD">Cards Only</option>
                    <option value="NETBANKING">Net Banking Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Provider</label>
                  <select
                    value={newRule.targetProvider}
                    onChange={(e) => setNewRule({ ...newRule, targetProvider: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs bg-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="PSP_A">PSP_A (High Reliability - 98%)</option>
                    <option value="PSP_B">PSP_B (Low Latency - 200ms)</option>
                    <option value="PSP_C">PSP_C (Cost Optimized)</option>
                    <option value="RAZORPAY">RAZORPAY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Amount (paise)</label>
                  <input
                    type="number"
                    value={newRule.minAmount}
                    onChange={(e) => setNewRule({ ...newRule, minAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Amount (paise)</label>
                  <input
                    type="number"
                    value={newRule.maxAmount}
                    onChange={(e) => setNewRule({ ...newRule, maxAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority (1 = Highest)</label>
                  <input
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weight Score Bonus</label>
                  <input
                    type="number"
                    value={newRule.weight}
                    onChange={(e) => setNewRule({ ...newRule, weight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
