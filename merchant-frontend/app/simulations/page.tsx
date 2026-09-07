'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, Clock, Zap, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';

interface SimulationItem {
  providerCode: string;
  simulationMode: string;
  injectedLatencyMs: number;
  targetSuccessRate: number;
  targetAvgLatencyMs: number;
  healthStatus: string;
}

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('PSP_A');
  const [mode, setMode] = useState('NORMAL');
  const [latency, setLatency] = useState(0);
  const [healthy, setHealthy] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/admin/simulations');
      const json = await res.json();
      if (json.success && json.data) {
        setSimulations(json.data);
      }
    } catch (e) {
      console.error('Failed to load simulations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const handleApplySimulation = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/admin/simulations/${selectedProvider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationMode: mode,
          injectedLatencyMs: Number(latency),
          healthy: healthy,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Applied ${mode} simulation to ${selectedProvider}!`);
        setTimeout(() => setActionMessage(''), 4000);
        fetchSimulations();
      }
    } catch (e) {
      console.error('Failed to apply simulation', e);
    }
  };

  const handleResetAll = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/simulations/reset', {
        method: 'POST',
      });
      if (res.ok) {
        setActionMessage('All mock providers reset to NORMAL operating mode!');
        setTimeout(() => setActionMessage(''), 4000);
        fetchSimulations();
      }
    } catch (e) {
      console.error('Failed to reset simulations', e);
    }
  };

  const setPresetScenario = (scenario: string) => {
    if (scenario === 'PSP_A_OUTAGE') {
      setSelectedProvider('PSP_A');
      setMode('OUTAGE');
      setHealthy(false);
      setLatency(0);
    } else if (scenario === 'PSP_A_TIMEOUT') {
      setSelectedProvider('PSP_A');
      setMode('FORCE_TIMEOUT');
      setHealthy(true);
      setLatency(2000);
    } else if (scenario === 'PSP_B_SLOW') {
      setSelectedProvider('PSP_B');
      setMode('SLOW_RESPONSE');
      setHealthy(true);
      setLatency(1500);
    } else if (scenario === 'NORMAL') {
      setSelectedProvider('PSP_A');
      setMode('NORMAL');
      setHealthy(true);
      setLatency(0);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-purple-600" /> Demo & Chaos Engineering Cockpit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Provider Simulation & Fault Injection</h1>
          <p className="text-sm text-gray-500 mt-1">
            Deliberately simulate upstream timeouts, outages, and slow latencies to demonstrate smart routing and safe failover.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Providers
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* QUICK PRESET SCENARIO BUTTONS */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Instant Demo Scenarios (Sections 7 & 35)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setPresetScenario('PSP_A_OUTAGE')}
            className="p-3 text-left rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition"
          >
            <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Scenario 2: PSP-A Outage
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Forces PSP-A DOWN; router automatically fails over to PSP-B.</p>
          </button>

          <button
            onClick={() => setPresetScenario('PSP_A_TIMEOUT')}
            className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition"
          >
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Scenario 3: Provider Timeout
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Forces timeout; payment becomes UNKNOWN and undergoes safe inquiry.</p>
          </button>

          <button
            onClick={() => setPresetScenario('PSP_B_SLOW')}
            className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition"
          >
            <div className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" /> Scenario 4: Latency Degradation
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Injects 1500ms delay; routing engine drops score and shifts traffic.</p>
          </button>

          <button
            onClick={() => setPresetScenario('NORMAL')}
            className="p-3 text-left rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition"
          >
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Scenario 1: Normal State
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Restores realistic 98%, 95%, 90% SLA baseline performance.</p>
          </button>
        </div>
      </div>

      {/* SIMULATION CONTROL FORM & STATUS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAULT INJECTION CONTROLS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" /> Fault Injection Configurator
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs bg-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="PSP_A">PSP_A (Mock High Reliability - 98%)</option>
              <option value="PSP_B">PSP_B (Mock Low Latency - 200ms)</option>
              <option value="PSP_C">PSP_C (Mock Cost Optimized - 90%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Simulation Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="NORMAL">NORMAL (Realistic Random SLA)</option>
              <option value="FORCE_SUCCESS">FORCE_SUCCESS (100% Success)</option>
              <option value="FORCE_FAILURE">FORCE_FAILURE (Card Decline / Error)</option>
              <option value="FORCE_TIMEOUT">FORCE_TIMEOUT (Upstream Timeout)</option>
              <option value="FORCE_UNKNOWN">FORCE_UNKNOWN (Indeterminate State)</option>
              <option value="SLOW_RESPONSE">SLOW_RESPONSE (Latency Spike)</option>
              <option value="OUTAGE">OUTAGE (Provider Down)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Injected Latency: <span className="font-bold text-blue-600">{latency} ms</span>
            </label>
            <input
              type="range"
              min="0"
              max="4000"
              step="100"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0ms (Default)</span>
              <span>2000ms</span>
              <span>4000ms</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="healthyCheck"
              checked={healthy}
              onChange={(e) => setHealthy(e.target.checked)}
              className="rounded text-blue-600 w-4 h-4"
            />
            <label htmlFor="healthyCheck" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Provider Available (Uncheck to trip Circuit Breaker)
            </label>
          </div>

          <button
            onClick={handleApplySimulation}
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition mt-2"
          >
            Apply Simulation Setting
          </button>
        </div>

        {/* ACTIVE SIMULATION TABLE */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Current Provider Simulation Matrix</h2>
            <span className="text-xs text-gray-400">Updates live across checkout & routing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Provider</th>
                  <th className="py-3.5 px-5">Active Mode</th>
                  <th className="py-3.5 px-5">Added Latency</th>
                  <th className="py-3.5 px-5">Target SLA</th>
                  <th className="py-3.5 px-5">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {simulations.map((item) => (
                  <tr key={item.providerCode} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-gray-900">{item.providerCode}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                          item.simulationMode === 'NORMAL'
                            ? 'bg-gray-100 text-gray-700'
                            : item.simulationMode === 'OUTAGE'
                            ? 'bg-rose-100 text-rose-800'
                            : item.simulationMode === 'FORCE_TIMEOUT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.simulationMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">{item.injectedLatencyMs} ms</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">
                      {(item.targetSuccessRate * 100).toFixed(0)}% / {item.targetAvgLatencyMs}ms
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.healthStatus === 'DOWN'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.healthStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
