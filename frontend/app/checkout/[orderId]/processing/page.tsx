'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Spinner } from '../../../../components/ui/Spinner';
import { getPayment, PaymentResponse } from '../../../../lib/api';
import { PaymentSseClient } from '../../../../lib/sse';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);

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

    // 1. Initial State Sync via GET request on mount (fallback in case terminal event already fired before stream opened)
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

    // 2. Subscribe to SSE Stream (GET /api/v1/payments/{id}/stream)
    sseClient = new PaymentSseClient({
      paymentId: paymentIdToUse,
      timeoutMs: 15000,
      onUpdate: (updated) => {
        setPayment(updated);
        if (updated.status === 'SUCCESS') {
          router.push(`/checkout/${orderId}/success?paymentId=${updated.id}`);
        } else if (updated.status === 'FAILED') {
          router.push(`/checkout/${orderId}/failed?paymentId=${updated.id}&code=${updated.errorCode || ''}&desc=${encodeURIComponent(updated.errorDescription || '')}`);
        }
      },
      onTimeoutOrError: () => {
        // Stream disconnected or timed out -> Route to Payment Uncertain / Verifying Screen
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

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={payment?.amount || 50000} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <Card className="text-center py-12 px-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Spinner size="lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-100">Processing Your Payment</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Please do not refresh, close, or navigate away from this window.
          </p>

          <div className="mt-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 inline-flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-violet-400 shrink-0" />
            <span>Verifying transaction status with bank via real-time SSE event stream</span>
          </div>
        </Card>
      </main>
    </div>
  );
}
