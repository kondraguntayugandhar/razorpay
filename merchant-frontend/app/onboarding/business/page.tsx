'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FastPayLogo } from '../../../components/FastPayLogo';
import { Check, HelpCircle, ArrowRight } from 'lucide-react';

export default function OnboardingBusinessPage() {
  const router = useRouter();

  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding/kyc');
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

          <div className="space-y-5 text-xs">
            {/* Step 1 */}
            <div className="flex items-start space-x-3 text-emerald-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </span>
              <div>
                <p className="text-gray-900">Account Creation</p>
                <p className="text-[10px] text-gray-400 font-normal">Basic details registered</p>
              </div>
            </div>

            {/* Step 2 (Active) */}
            <div className="flex items-start space-x-3 text-blue-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="text-blue-600">Business Details</p>
                <p className="text-[10px] text-gray-400 font-normal">Company info & address</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3 text-gray-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                3
              </span>
              <div>
                <p className="text-gray-500 font-semibold">Bank Details</p>
                <p className="text-[10px] text-gray-400 font-normal">For settlements</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3 text-gray-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                4
              </span>
              <div>
                <p className="text-gray-500 font-semibold">Identity Verification</p>
                <p className="text-[10px] text-gray-400 font-normal">KYC & Documents</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS FORM BOX */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business Details</h1>
            <p className="text-xs text-gray-500 mt-1">Provide information about your registered entity to configure your settlement profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-2xs space-y-6">
            {/* SECTION 1: BUSINESS IDENTITY */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                <span className="text-base">🏢</span>
                <h3 className="font-bold text-sm text-gray-900">Business Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Legal Business Name *</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="As registered on official documents"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Trade Name *</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="What your customers see"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="e-commerce">E-Commerce & Retail</option>
                    <option value="saas">SaaS & Software</option>
                    <option value="education">Education & EdTech</option>
                    <option value="services">Professional Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Website URL (Optional)</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.yourdomain.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PUBLIC CONTACT INFO */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                <span className="text-base">✉️</span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Public Contact Info</h3>
                  <p className="text-[10px] text-gray-400 font-medium">This information may appear on customer receipts and payment pages.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Email *</label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="support@yourcompany.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Phone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: REGISTERED ADDRESS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                <span className="text-base">📍</span>
                <h3 className="font-bold text-sm text-gray-900">Registered Address</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Flat / Building / Street *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Registered office address"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 560008"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City / District"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                      required
                    >
                      <option value="">Select state</option>
                      <option value="KA">Karnataka</option>
                      <option value="MH">Maharashtra</option>
                      <option value="DL">Delhi</option>
                      <option value="TN">Tamil Nadu</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Save as draft
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <span>Save and continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
