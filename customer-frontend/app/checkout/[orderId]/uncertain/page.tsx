'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getPayment, PaymentResponse } from '../../../../lib/api';
import { ArrowLeft, Clock, ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

const FALLBACK_POLL_INTERVAL_MS = 5000;

export default function PaymentUncertainPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = (params?.orderId as string) || 'demo';
  const paymentIdParam = searchParams?.get('paymentId') || 'pay_uncertain_001';

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      try {
        const data = await getPayment(paymentIdParam);
        setPayment(data);
        setPollCount((prev) => prev + 1);

        if (data.status === 'SUCCESS') {
          if (pollInterval) clearInterval(pollInterval);
          router.push(`/checkout/${orderId}/success?paymentId=${data.id}`);
        } else if (data.status === 'FAILED') {
          if (pollInterval) clearInterval(pollInterval);
          router.push(`/checkout/${orderId}/failed?paymentId=${data.id}&code=${data.errorCode || ''}&desc=${encodeURIComponent(data.errorDescription || '')}`);
        }
      } catch (err) {
        console.warn('Fallback polling check failed:', err);
      }
    };

    checkStatus();
    pollInterval = setInterval(checkStatus, FALLBACK_POLL_INTERVAL_MS);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [paymentIdParam, orderId, router]);

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
        <div className="w-full bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center text-amber-600 shadow-xs">
              <Clock className="h-9 w-9 animate-pulse" />
            </div>
          </div>

          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Payment Verifying
          </span>

          <h2 className="text-xl font-bold text-gray-900 mt-1">We are checking your payment status</h2>

          <div className="my-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-medium text-left flex items-start space-x-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Please don't pay again!</p>
              <p className="mt-0.5 text-amber-800">Your payment may already be processing at your bank.</p>
            </div>
          </div>

          <div className="my-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-left font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-gray-600">
              <span>Payment ID:</span>
              <span className="text-gray-900 font-bold">{paymentIdParam}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>Status:</span>
              <span className="text-amber-700 font-semibold">{payment?.status || 'PENDING_VERIFICATION'}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
            <span>Polling banking gateway for final confirmation (Check #{pollCount})...</span>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center space-x-1.5 max-w-sm">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>If funds are deducted without confirmation, an auto-refund will initiate within 24 hours.</span>
        </div>
      </main>
    </div>
  );
}
