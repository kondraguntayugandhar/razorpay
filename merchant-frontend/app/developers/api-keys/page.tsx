'use client';

import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Edit2,
  Trash2,
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react';

export default function ApiKeysPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'test'>('test');
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generate modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('test');
  const [generatedKeyResult, setGeneratedKeyResult] = useState<any | null>(null);

  const publishableKey = activeTab === 'test' ? 'fp_test_••••••8392' : 'fp_live_••••••8392';
  const secretKey = activeTab === 'test' ? 'fp_test_secret_••••••8392' : 'fp_live_secret_••••••8392';

  const handleCopy = (keyStr: string, name: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockKeyId = `fp_${newKeyEnv}_${Math.random().toString(36).substring(2, 10)}`;
    const mockSecret = `fp_secret_${Math.random().toString(36).substring(2, 18)}`;
    setGeneratedKeyResult({ id: mockKeyId, secret: mockSecret, name: newKeyName || 'Primary API Key' });
    setShowGenerateModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Keys</h1>
          <p className="text-xs text-gray-500 mt-1">Manage credentials used to authenticate your applications with FastPay.</p>
        </div>

        <button
          onClick={() => {
            setNewKeyEnv(activeTab);
            setShowGenerateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* RED SECURITY WARNING ALERT BOX */}
      <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl flex items-start space-x-3 text-xs text-red-900 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-red-900 text-xs">
            {activeTab === 'live' ? 'Live keys can process real payments. Keep them secure.' : 'Security Warning: Never share your secret key'}
          </p>
          <p className="text-red-700 leading-relaxed">
            {activeTab === 'live'
              ? 'Your live secret keys carry full privileges to charge real bank accounts. Store them in encrypted environment variables.'
              : 'Test keys are used for development and sandbox testing. FastPay staff will never ask for your secret key.'}
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION (LIVE KEYS / TEST KEYS) */}
      <div className="border-b border-gray-200 flex items-center space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-3 transition-colors ${
            activeTab === 'live'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          LIVE KEYS
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`pb-3 transition-colors ${
            activeTab === 'test'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          TEST KEYS
        </button>
      </div>

      {/* BOX 1: DEFAULT KEYS */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-gray-900">
                {activeTab === 'test' ? 'Default Test Keys' : 'Production Live Keys'}
              </h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-bold text-[9px] uppercase tracking-wider rounded border border-gray-200">
                SYSTEM
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeTab === 'test' ? 'Used for standard integrations in the test environment.' : 'Used for live production checkout authorization.'}
            </p>
          </div>

          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Roll Key</span>
          </button>
        </div>

        {/* KEYS INPUT BOX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PUBLISHABLE KEY SUB-BOX */}
          <div className="p-4 bg-gray-50/60 border border-gray-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">PUBLISHABLE KEY</span>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800">
              <span className="truncate">{publishableKey}</span>
              <button
                onClick={() => handleCopy(publishableKey, 'pub')}
                className="text-gray-400 hover:text-gray-700 ml-2"
                title="Copy Publishable Key"
              >
                {copiedKey === 'pub' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* SECRET KEY SUB-BOX */}
          <div className="p-4 bg-gray-50/60 border border-gray-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SECRET KEY</span>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800">
              <span className="truncate">
                {showSecret ? secretKey : '••••••••••••••••••••••••••••••••••••'}
              </span>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecret ? 'Hide' : 'Reveal'}</span>
                </button>
                <button
                  onClick={() => handleCopy(secretKey, 'sec')}
                  className="text-gray-400 hover:text-gray-700"
                  title="Copy Secret Key"
                >
                  {copiedKey === 'sec' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER INFO LINE */}
        <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
          <span>Created: Oct 12, 2023 • Last used: 2 minutes ago</span>
          <a href="/developers/logs" className="text-blue-600 hover:underline font-semibold flex items-center space-x-1">
            <span>View API logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* GENERATE NEW KEY MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleGenerateKeySubmit} className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Generate New API Key</h3>
              <button type="button" onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Backend Production Server"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('live')}
                    className={`py-2 border rounded-lg font-bold text-xs ${
                      newKeyEnv === 'live' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('test')}
                    className={`py-2 border rounded-lg font-bold text-xs ${
                      newKeyEnv === 'test' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Test
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                ⓘ Keep your secret key safe. Never store API credentials in publicly accessible repositories.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-xs"
              >
                Generate Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GENERATED KEY SUCCESS DIALOG */}
      {generatedKeyResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>API Key Generated Successfully</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400">KEY ID</span>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-900 mt-1 flex justify-between items-center">
                  <span>{generatedKeyResult.id}</span>
                  <button onClick={() => handleCopy(generatedKeyResult.id, 'gid')} className="text-blue-600 font-bold hover:underline">
                    Copy Key ID
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400">SECRET KEY</span>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-900 mt-1 flex justify-between items-center">
                  <span>{generatedKeyResult.secret}</span>
                  <button onClick={() => handleCopy(generatedKeyResult.secret, 'gsec')} className="text-blue-600 font-bold hover:underline">
                    Copy Secret
                  </button>
                </div>
              </div>

              <p className="text-rose-600 font-bold text-[11px] pt-1">
                ⚠️ This secret will only be shown once. Please copy and store it securely.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                onClick={() => setGeneratedKeyResult(null)}
                className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
