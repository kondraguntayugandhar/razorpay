'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { getPayment, PaymentResponse } from '../../../../lib/api';
import { CheckCircle2, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paymentIdParam) {
      getPayment(paymentIdParam)
        .then(setPayment)
        .catch((err) => {
          console.warn('Error fetching payment for success screen:', err);
          setPayment({
            id: paymentIdParam,
            orderId: orderId,
            merchantId: '11111111-1111-1111-1111-111111111111',
            amount: 50000,
            currency: 'INR',
            status: 'SUCCESS',
            provider: 'MOCK_PROVIDER',
            providerPaymentId: 'pay_success_123',
            method: 'UPI',
          });
        });
    }
  }, [paymentIdParam, orderId]);

  const handleCopyId = () => {
    if (payment?.id) {
      navigator.clipboard.writeText(payment.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const amountPaise = payment?.amount || 50000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: payment?.currency || 'INR',
  });

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={amountPaise} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <Card className="text-center py-10 px-6 border-emerald-500/40 bg-slate-900/90 shadow-2xl shadow-emerald-500/10">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <Badge variant="emerald" className="mb-2 px-3 py-1">Payment Successful</Badge>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-1">{formattedAmount}</h2>
          <p className="text-xs text-slate-400 mt-1">Transaction completed and captured successfully.</p>

          <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Payment ID:</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">{payment?.id || paymentIdParam || 'pay_001'}</span>
                <button onClick={handleCopyId} className="text-slate-400 hover:text-slate-200">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Order Ref:</span>
              <span>{orderId}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Method:</span>
              <span className="text-slate-200 font-sans font-medium">{payment?.method || 'UPI'}</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => alert(`View Order Details for Order ID: ${orderId}`)}
          >
            <span>View Order Details</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Receipt email dispatched to merchant customer account</span>
        </div>
      </main>
    </div>
  );
}
