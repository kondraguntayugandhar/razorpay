'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { setMerchantKey } from '../../lib/auth';
import { Zap, Key, ShieldCheck, AlertCircle } from 'lucide-react';

export default function MerchantLoginPage() {
  const router = useRouter();
  const [apiKeyInput, setApiKeyInput] = useState<string>('rzp_test_acme_key_001');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      setMerchantKey(apiKeyInput);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid Merchant API Key or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-violet-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 mb-3">
            <Zap className="h-6 w-6 text-slate-950 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">FastPay Console Login</h1>
          <p className="text-xs text-slate-400 mt-1">Authenticate using your Merchant API Key</p>
        </div>

        <Card className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Merchant API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="rzp_test_acme_key_001"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={loading}>
              <span>Authenticate & Enter Console</span>
            </Button>
          </form>

          <div className="mt-4 text-center text-[11px] text-slate-500">
            Default seeded test key: <code className="text-emerald-400 font-mono">rzp_test_acme_key_001</code>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Encrypted Session Management</span>
        </div>
      </div>
    </div>
  );
}
