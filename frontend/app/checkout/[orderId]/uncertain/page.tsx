'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { getPayment, PaymentResponse } from '../../../../lib/api';
import { Clock, ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

const FALLBACK_POLL_INTERVAL_MS = 5000;

export default function PaymentUncertainPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
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

    // Execute immediate status check on mount
    checkStatus();

    // Start 5-second polling interval ONLY for this uncertain fallback screen
    pollInterval = setInterval(checkStatus, FALLBACK_POLL_INTERVAL_MS);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [paymentIdParam, orderId, router]);

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={payment?.amount || 50000} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <Card className="text-center py-8 px-6 border-amber-500/40 bg-slate-900/90 shadow-2xl shadow-amber-500/10">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400">
              <Clock className="h-10 w-10 animate-pulse" />
            </div>
          </div>

          <Badge variant="amber" className="mb-2 px-3 py-1">Payment Verifying</Badge>
          <h2 className="text-xl font-bold text-slate-100 mt-1">We are checking your payment status</h2>
          
          <div className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <span>Please don't pay again! Your payment may already be processing at the bank.</span>
          </div>

          <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Payment ID:</span>
              <span className="text-amber-400 font-bold">{paymentIdParam}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-slate-200">{payment?.status || 'PENDING_VERIFICATION'}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
            <span>Polling banking gateway for final confirmation (Check #{pollCount})...</span>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-1">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          <span>If funds are deducted without confirmation, auto-refund will initiate within 24 hours.</span>
        </div>
      </main>
    </div>
  );
}
