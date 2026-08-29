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
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Authoritative 5-minute expiry calculation based on backend expiresAt timestamp
  useEffect(() => {
    let expiryTimestamp: number = Date.now() + FIVE_MINUTES_SECONDS * 1000;

    const storedExpiry = sessionStorage.getItem(`session_expiresAt_${orderId}`);
    if (storedExpiry) {
      const parsed = parseInt(storedExpiry, 10);
      if (!isNaN(parsed) && parsed > Date.now()) {
        expiryTimestamp = parsed;
      }
    } else {
      sessionStorage.setItem(`session_expiresAt_${orderId}`, String(expiryTimestamp));
    }

    const calcRemaining = () => {
      const diff = Math.floor((expiryTimestamp - Date.now()) / 1000);
      if (diff <= 0) {
        setIsExpired(true);
        return 0;
      }
      return diff;
    };

    setTimeLeft(calcRemaining());

    const timer = setInterval(() => {
      const rem = calcRemaining();
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

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
        if (data.expiresAt) {
          const apiExpiry = new Date(data.expiresAt).getTime();
          if (!isNaN(apiExpiry) && apiExpiry > Date.now()) {
            sessionStorage.setItem(`session_expiresAt_${orderId}`, String(apiExpiry));
          }
        }
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
        setIsExpired(true);
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
            {isExpired ? (
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            {isExpired ? 'Payment Session Expired' : 'Processing Your Payment'}
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Amount: <span className="font-bold text-gray-900">{formattedAmount}</span>
          </p>

          {/* 5-MINUTE LIVE COUNTDOWN TIMER */}
          <div className={`my-5 p-4 rounded-xl border flex items-center justify-center space-x-3 ${isExpired ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-blue-50/70 border-blue-100 text-blue-950'}`}>
            <Clock className={`h-5 w-5 ${isExpired ? 'text-rose-600' : 'text-blue-600 animate-pulse'}`} />
            <div className="text-left">
              <span className="text-[11px] font-semibold block uppercase tracking-wider">
                {isExpired ? 'Session Expired' : 'Time Remaining to Complete Payment'}
              </span>
              <span className="text-2xl font-mono font-bold">{isExpired ? '00:00' : formattedTimer}</span>
            </div>
          </div>

          {isExpired ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
              <p className="font-bold">This checkout session has expired after 5 minutes.</p>
              <p>Payment actions are disabled. Please return to the merchant site to generate a new payment link.</p>
              <button
                onClick={() => router.push(`/checkout/${orderId}`)}
                className="mt-2 px-4 py-2 bg-rose-600 text-white font-bold rounded-lg text-xs"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center space-x-2.5 text-left">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
              <span>Verifying transaction status with bank via real-time SSE event stream...</span>
            </div>
          )}

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
