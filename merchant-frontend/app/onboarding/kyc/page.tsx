'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FastPayLogo } from '../../../components/FastPayLogo';
import { Check, Upload, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../../lib/api';

export default function OnboardingKycPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pan' | 'gstin' | 'address'>('pan');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [gstinNumber, setGstinNumber] = useState('22AAAAA0000A1Z5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/merchant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `onboard_${Date.now()}@meridian.com`,
          password: 'SecurePassword123!',
          businessName: 'Meridian Home & Living Pvt Ltd',
          pan: panNumber,
          gstin: gstinNumber
        }),
      });

      const data = await res.json();
      if (data.data?.token) {
        sessionStorage.setItem('fastpay_merchant_key', data.data.token);
      } else {
        sessionStorage.setItem('fastpay_merchant_key', 'rzp_test_acme_key_001');
      }
    } catch (err) {
      sessionStorage.setItem('fastpay_merchant_key', 'rzp_test_acme_key_001');
    } finally {
      setLoading(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* TOP BAR */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <FastPayLogo size="md" />
        <div className="flex items-center space-x-4 text-xs">
          <button className="text-gray-400 hover:text-gray-700">
            <HelpCircle className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-semibold">
            Save & exit
          </Link>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* LEFT STEPPER */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 space-y-6 shrink-0 select-none hidden md:block">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Setup Progress</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-3 text-emerald-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </span>
              <div>
                <p className="text-gray-900">Business Details</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-emerald-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </span>
              <div>
                <p className="text-gray-900">Business Registration</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-blue-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="text-blue-600">KYC Documents</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-gray-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                4
              </span>
              <div>
                <p className="text-gray-500 font-semibold">Authorized Person</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business KYC Details</h1>
            <p className="text-xs text-gray-500 mt-1">Upload mandatory documents to verify your business identity. Ensure images are clear and text is readable.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-2xs space-y-6">
            {/* TABS */}
            <div className="border-b border-gray-200 flex items-center space-x-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('pan')}
                className={`pb-3 transition-colors ${
                  activeTab === 'pan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Business PAN
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gstin')}
                className={`pb-3 transition-colors ${
                  activeTab === 'gstin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                GSTIN
              </button>
            </div>

            {/* SUB-BOX 1: UPLOAD BUSINESS PAN */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-gray-900">Upload Business PAN</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Click or drag file to upload</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG, PDF (max. 10MB)</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-gray-900">ⓘ Guidelines</p>
                  <ul className="space-y-1 text-gray-600 text-[11px] list-disc list-inside leading-relaxed">
                    <li>Must be a valid Indian PAN card.</li>
                    <li>Name on card must match business registration.</li>
                  </ul>
                </div>
              </div>

              {/* PAN Number Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">PAN Number *</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full md:w-1/2 px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/onboarding/business')}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <span>{loading ? 'Submitting Registration...' : 'Complete & Launch'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
