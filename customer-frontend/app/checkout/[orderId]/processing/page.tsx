'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getPayment, PaymentResponse } from '../../../../lib/api';
import { PaymentSseClient } from '../../../../lib/sse';
import { ArrowLeft, Clock, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

const FIVE_MINUTES_SECONDS = 300; // 5 minutes = 300 seconds

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = (params?.orderId as string) || 'demo';
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(FIVE_MINUTES_SECONDS);

  // 5-minute live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let sseClient: PaymentSseClient | null = null;
    let paymentIdToUse = paymentIdParam;

    if (!paymentIdToUse) {
      const stored = sessionStorage.getItem(`payment_${orderId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          paymentIdToUse = parsed.id;
        } catch (ignored) {}
      }
    }

    if (!paymentIdToUse) {
      paymentIdToUse = 'pay_proc_demo_001';
    }

    getPayment(paymentIdToUse)
      .then((data) => {
        setPayment(data);
        if (data.status === 'SUCCESS') {
          router.push(`/checkout/${orderId}/success?paymentId=${data.id}`);
        } else if (data.status === 'FAILED') {
          router.push(`/checkout/${orderId}/failed?paymentId=${data.id}&code=${data.errorCode || ''}&desc=${encodeURIComponent(data.errorDescription || '')}`);
        }
      })
      .catch((err) => {
        console.warn('Initial GET status sync warning:', err);
      });

    // 5 Minutes SSE Timeout (300,000 ms)
    sseClient = new PaymentSseClient({
      paymentId: paymentIdToUse,
      timeoutMs: 300000, // 5 minutes
      onUpdate: (updated) => {
        setPayment(updated);
        if (updated.status === 'SUCCESS') {
          router.push(`/checkout/${orderId}/success?paymentId=${updated.id}`);
        } else if (updated.status === 'FAILED') {
          router.push(`/checkout/${orderId}/failed?paymentId=${updated.id}&code=${updated.errorCode || ''}&desc=${encodeURIComponent(updated.errorDescription || '')}`);
        }
      },
      onTimeoutOrError: () => {
        router.push(`/checkout/${orderId}/uncertain?paymentId=${paymentIdToUse}`);
      },
    });

    sseClient.connect();

    return () => {
      if (sseClient) {
        sseClient.close();
      }
    };
  }, [orderId, paymentIdParam, router]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const amountPaise = payment?.amount || 10000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

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
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">Processing Your Payment</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Amount: <span className="font-bold text-gray-900">{formattedAmount}</span>
          </p>

          {/* 5-MINUTE LIVE COUNTDOWN TIMER */}
          <div className="my-5 p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
            <div className="text-left">
              <span className="text-[11px] text-blue-700 font-semibold block uppercase tracking-wider">
                Time Remaining to Complete Payment
              </span>
              <span className="text-2xl font-mono font-bold text-blue-950">{formattedTimer}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center space-x-2.5 text-left">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
            <span>Verifying transaction status with bank via real-time SSE event stream...</span>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Please do not refresh, close, or navigate away from this window.
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Secured by <b>FastPay</b> Gateway</span>
        </div>
      </main>
    </div>
  );
}
