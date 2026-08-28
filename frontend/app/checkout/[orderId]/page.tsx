'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '../../../components/checkout/Header';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { getOrder, createPayment, OrderResponse } from '../../../lib/api';
import { QrCode, CreditCard, Building2, Wallet, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function MethodSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    // Load or create default order for demo if orderId is 'new' or valid UUID
    if (orderId === 'demo') {
      setOrder({
        id: 'demo-order-123',
        merchantId: '11111111-1111-1111-1111-111111111111',
        amount: 50000,
        currency: 'INR',
        status: 'CREATED',
        receipt: 'rcpt_demo_001',
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    getOrder(orderId)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        // Fallback for demo display if backend is offline or invalid UUID passed
        console.warn('Could not fetch order from backend:', err);
        setOrder({
          id: orderId,
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: 50000,
          currency: 'INR',
          status: 'CREATED',
          receipt: 'rcpt_001',
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
      });
  }, [orderId]);

  const handleSelectUpi = async () => {
    setSubmitting(true);
    try {
      // Initiate UPI Payment via backend
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      const payment = await createPayment(targetOrderId, 'UPI');
      
      // Save payment context locally and route to UPI Screen
      sessionStorage.setItem(`payment_${orderId}`, JSON.stringify(payment));
      router.push(`/checkout/${orderId}/upi?paymentId=${payment.id}`);
    } catch (err: any) {
      console.error('Failed to initiate UPI payment:', err);
      // Fallback redirect with paymentId parameter if backend mock is active
      router.push(`/checkout/${orderId}/upi`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 text-sm">Loading checkout session...</p>
        </div>
      </div>
    );
  }

  const amountPaise = order?.amount || 50000;

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={amountPaise} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-100">Select Payment Method</h1>
          <p className="text-xs text-slate-400 mt-1">Choose your preferred option to complete this payment instantly.</p>
        </div>

        {/* Option 1: UPI (Recommended) */}
        <Card className="mb-4 relative overflow-hidden border-emerald-500/40 bg-slate-900/90 shadow-xl shadow-emerald-500/5">
          <div className="absolute top-0 right-0">
            <Badge variant="emerald" className="rounded-bl-xl rounded-tr-none px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1 inline" /> Recommended
            </Badge>
          </div>

          <div className="flex items-start space-x-4 pt-1">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <QrCode className="h-6 w-6 text-emerald-400" />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-100 text-base">UPI (Intent & Instant QR)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Scan QR via any app or launch GPay / PhonePe / BHIM on mobile.</p>

              {/* Generic App Badges */}
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Google Pay</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">PhonePe</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">BHIM</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">+Any UPI</span>
              </div>

              <div className="mt-4">
                <Button variant="primary" onClick={handleSelectUpi} isLoading={submitting}>
                  <span>Pay with UPI</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Option 2: Cards (Demo Mode) */}
        <Card className="mb-3 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => router.push(`/checkout/${orderId}/card`)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-200 text-sm">Credit / Debit Card</span>
                  <Badge variant="violet">Demo Form</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Visa, Mastercard, RuPay, Maestro</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500" />
          </div>
        </Card>

        {/* Option 3: Net Banking (Demo Mode) */}
        <Card className="mb-3 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => router.push(`/checkout/${orderId}/netbanking`)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-200 text-sm">Net Banking</span>
                  <Badge variant="slate">Sandbox</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">SBI, HDFC, ICICI, Axis & 50+ Banks</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500" />
          </div>
        </Card>

        {/* Option 4: Wallets */}
        <Card className="mb-6 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-500">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <span className="font-medium text-slate-400 text-sm">Wallets</span>
                <p className="text-xs text-slate-600 mt-0.5">Coming Soon</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center flex items-center justify-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Secured by FastPay 256-bit Encrypted Infrastructure</span>
        </div>
      </main>
    </div>
  );
}
