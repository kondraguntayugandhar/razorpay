'use client';

import React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, XCircle, RefreshCw, CreditCard, QrCode, ShieldX } from 'lucide-react';

export default function FailedPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = (params?.orderId as string) || 'demo';
  const errorCode = searchParams?.get('code') || 'PAYMENT_FAILED';
  const errorDesc = searchParams?.get('desc') || 'The transaction was declined by the issuing bank or payment gateway.';

  const handleRetryMethod = (methodRoute: string) => {
    router.push(`/checkout/${orderId}${methodRoute}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* TOPBAR */}
      <header className="topbar">
        <button className="back-btn" onClick={() => router.push(`/checkout/${orderId}`)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="portal-badge">F</div>
        <div className="portal-title">FastPay</div>
      </header>

      <main className="max-w-xl mx-auto w-full px-5 py-8 flex-1 flex flex-col items-center">
        <div className="w-full bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center text-rose-600 shadow-xs">
              <XCircle className="h-9 w-9" />
            </div>
          </div>

          <span className="inline-block bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Payment Failed
          </span>

          <h2 className="text-xl font-bold text-gray-900 mt-1">Transaction Failed</h2>

          <div className="my-5 p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-left">
            <div className="flex items-center space-x-2 text-rose-700 font-mono text-xs font-bold mb-1">
              <ShieldX className="h-4 w-4 shrink-0" />
              <span>{errorCode}</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-sans">{decodeURIComponent(errorDesc)}</p>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Don't worry — no funds were deducted from your bank account. You can retry with a different payment method below.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleRetryMethod('')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Another Payment Method</span>
            </button>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleRetryMethod('/upi')}
                className="py-3 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-center space-x-2 transition-colors"
              >
                <QrCode className="h-4 w-4 text-emerald-600" />
                <span>Try UPI Again</span>
              </button>

              <button
                onClick={() => handleRetryMethod('/card')}
                className="py-3 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-center space-x-2 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span>Try Card</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
