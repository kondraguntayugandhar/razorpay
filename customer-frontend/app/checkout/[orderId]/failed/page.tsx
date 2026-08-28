'use client';

import React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { XCircle, RefreshCw, CreditCard, QrCode, ShieldX } from 'lucide-react';

export default function FailedPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const errorCode = searchParams?.get('code') || 'PAYMENT_FAILED';
  const errorDesc = searchParams?.get('desc') || 'The transaction was declined by the issuing bank or payment gateway.';

  const handleRetryMethod = (methodRoute: string) => {
    router.push(`/checkout/${orderId}${methodRoute}`);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={50000} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <Card className="text-center py-8 px-6 border-rose-500/40 bg-slate-900/90 shadow-2xl shadow-rose-500/10">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400">
              <XCircle className="h-10 w-10" />
            </div>
          </div>

          <Badge variant="rose" className="mb-2 px-3 py-1">Payment Failed</Badge>

          <div className="my-4 p-4 rounded-xl bg-slate-950/90 border border-rose-500/20 text-left">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold mb-1">
              <ShieldX className="h-4 w-4 shrink-0" />
              <span>{errorCode}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{decodeURIComponent(errorDesc)}</p>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Don't worry — no funds were deducted from your bank account. You can retry with a different payment method below.
          </p>

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => handleRetryMethod('')}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              <span>Try Another Payment Method</span>
            </Button>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleRetryMethod('/upi')}
                className="py-3 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
              >
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>Try UPI Again</span>
              </button>

              <button
                onClick={() => handleRetryMethod('/card')}
                className="py-3 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-violet-400" />
                <span>Try Card</span>
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
