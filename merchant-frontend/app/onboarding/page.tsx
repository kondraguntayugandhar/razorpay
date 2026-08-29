'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FastPayLogo } from '../../components/FastPayLogo';
import { Rocket, ArrowRight, Lock } from 'lucide-react';

export default function OnboardingWelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* LEFT SIDEBAR STEPPER */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-6">
          <FastPayLogo size="md" />

          {/* PROGRESS */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Setup Progress</span>
              <span>0%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-0 h-full bg-blue-600 rounded-full"></div>
            </div>
          </div>

          {/* STEPS LIST */}
          <div className="space-y-4 pt-4 text-xs font-medium text-gray-400">
            <div className="flex items-start space-x-3 text-gray-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p>Business Details</p>
                <p className="text-[10px] text-gray-400 font-normal">Company info & address</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                2
              </span>
              <div>
                <p className="font-semibold text-gray-500">Business Verification</p>
                <p className="text-[10px] text-gray-400 font-normal">Identity & documents</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                3
              </span>
              <div>
                <p className="font-semibold text-gray-500">Bank Account</p>
                <p className="text-[10px] text-gray-400 font-normal">Where you receive payouts</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                4
              </span>
              <div>
                <p className="font-semibold text-gray-500">Payment Methods</p>
                <p className="text-[10px] text-gray-400 font-normal">UPI, Cards, Wallets</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                5
              </span>
              <div>
                <p className="font-semibold text-gray-500">Review</p>
                <p className="text-[10px] text-gray-400 font-normal">View details & submit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
            Save & exit
          </Link>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 p-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Rocket className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome to FastPay.</h1>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              Let's get your business ready to accept payments. It only takes a few minutes to set up your account.
            </p>
          </div>

          <div>
            <button
              onClick={() => router.push('/onboarding/business')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center space-x-2"
            >
              <span>Start setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 pt-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Your data is secure and encrypted.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
