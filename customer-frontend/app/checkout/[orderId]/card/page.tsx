'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { CreditCard, ArrowLeft, ShieldAlert, Lock } from 'lucide-react';

export default function CardPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSimulateCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/checkout/${orderId}/processing?method=CARD`);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={50000} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <button
          onClick={() => router.push(`/checkout/${orderId}`)}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change Payment Method</span>
        </button>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-base">Pay with Card</h2>
                <p className="text-xs text-slate-400">Credit or Debit Card</p>
              </div>
            </div>
            <Badge variant="amber">Demo Form Only</Badge>
          </div>

          <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demo Sandbox Mode</p>
              <p className="text-amber-400/80 mt-0.5">
                This is a visual demo form. Card details are strictly local UI state and are <strong>never transmitted or stored</strong> anywhere.
              </p>
            </div>
          </div>

          <form onSubmit={handleSimulateCardPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4111 •••• •••• 1111"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
                <CreditCard className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">CVV / CVC</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    required
                  />
                  <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="Name on card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="secondary">
                <span>Simulate Demo Card Payment</span>
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
