'use client';

import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Key, ShieldAlert, RefreshCw, Copy, Check } from 'lucide-react';

export default function ApiKeysPage() {
  const [copied, setCopied] = React.useState(false);

  const maskedKey = 'rzp_test_••••••••••••001';
  const rawKeyPrefix = 'rzp_test_acme_key_001';

  const handleCopy = () => {
    navigator.clipboard.writeText(rawKeyPrefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = () => {
    alert('Key Rotation Notice: Endpoint POST /api/v1/merchants/api-keys/rotate is noted as a backend gap. Present key remains active.');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">API Keys & Authentication</h1>
        <p className="text-xs text-slate-400 mt-1">Manage merchant API credentials for FastPay backend authentication</p>
      </div>

      {/* Security Model Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Security Best Practice</p>
          <p className="text-amber-400/80 mt-0.5">
            Full key secrets are shown only once at creation time. For security, only key prefixes and last-4 identifiers are displayed below.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">Active Merchant API Key</h2>
              <p className="text-xs text-slate-400">Environment: Test Sandbox Mode</p>
            </div>
          </div>
          <Badge variant="emerald">ACTIVE</Badge>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs mb-6">
          <div>
            <span className="text-slate-500 text-[11px] block">Key Identifier:</span>
            <span className="text-emerald-400 font-bold text-sm tracking-wider">{maskedKey}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Created: Aug 28, 2026 • Never Expires</p>
          <Button variant="secondary" onClick={handleRotateKey} className="w-full sm:w-auto px-4 py-2">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            <span>Rotate Key Pair</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
