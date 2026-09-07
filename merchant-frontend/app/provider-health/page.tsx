'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertOctagon, CheckCircle2, Clock, Zap, RefreshCw } from 'lucide-react';

interface ProviderTelemetry {
  providerCode: string;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  timeoutRequests: number;
  successRatePercent: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  circuitBreakerState: string;
  available: boolean;
}

export default function ProviderHealthPage() {
  const [telemetry, setTelemetry] = useState<ProviderTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/routing/providers/health');
      const json = await res.json();
      if (json.success && json.data) {
        setTelemetry(json.data);
      }
    } catch (e) {
      console.error('Failed to load telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(fetchHealth, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Telemetry Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Provider Health & Resilience</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time latency percentiles, sliding-window success rates, and Resilience4j circuit-breaker states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600"
            />
            Auto-refresh (3s)
          </label>
          <button
            onClick={fetchHealth}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Now
          </button>
        </div>
      </div>

      {/* PROVIDER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {telemetry.map((prov) => {
          const isHealthy = prov.circuitBreakerState === 'CLOSED' && prov.available;
          const isHalfOpen = prov.circuitBreakerState === 'HALF_OPEN';

          return (
            <div
              key={prov.providerCode}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                !prov.available
                  ? 'border-rose-200 bg-rose-50/10'
                  : isHalfOpen
                  ? 'border-amber-200 bg-amber-50/10'
                  : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">
                    {prov.providerCode}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      !prov.available
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isHalfOpen
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {!prov.available ? (
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {prov.available ? 'HEALTHY' : 'DOWN'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Circuit Breaker</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
                        prov.circuitBreakerState === 'OPEN'
                          ? 'bg-rose-100 text-rose-800'
                          : prov.circuitBreakerState === 'HALF_OPEN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prov.circuitBreakerState}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {prov.circuitBreakerState === 'OPEN'
                        ? 'Traffic halted (auto-failover)'
                        : prov.circuitBreakerState === 'HALF_OPEN'
                        ? 'Testing probe requests'
                        : 'Accepting full traffic'}
                    </span>
                  </div>
                </div>

                {/* SUCCESS RATE PROGRESS */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-500">Success Rate</span>
                    <span className={prov.successRatePercent >= 95 ? 'text-emerald-600' : 'text-amber-600'}>
                      {prov.successRatePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${prov.successRatePercent >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, prov.successRatePercent))}%` }}
                    />
                  </div>
                </div>

                {/* LATENCIES */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">Avg</div>
                    <div className="text-xs font-bold text-gray-900 mt-0.5">{prov.avgLatencyMs}ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">P95</div>
                    <div className="text-xs font-bold text-gray-900 mt-0.5">{prov.p95LatencyMs}ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">P99</div>
                    <div className="text-xs font-bold text-gray-900 mt-0.5">{prov.p99LatencyMs}ms</div>
                  </div>
                </div>
              </div>

              {/* STATS FOOTER */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Total Calls: <strong>{prov.totalRequests}</strong></span>
                <span>Timeouts: <strong className="text-amber-600">{prov.timeoutRequests}</strong></span>
                <span>Fails: <strong className="text-rose-600">{prov.failedRequests}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
