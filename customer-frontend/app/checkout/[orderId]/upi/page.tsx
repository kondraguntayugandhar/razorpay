'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '../../../../components/checkout/Header';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { getPayment, createPayment, PaymentResponse } from '../../../../lib/api';
import { PaymentSseClient } from '../../../../lib/sse';
import { Smartphone, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

export default function UpiPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('Waiting for payment confirmation...');

  useEffect(() => {
    let sseClient: PaymentSseClient | null = null;

    const initPayment = async () => {
      try {
        let currentPayment: PaymentResponse | null = null;

        if (paymentIdParam) {
          currentPayment = await getPayment(paymentIdParam);
        } else {
          const stored = sessionStorage.getItem(`payment_${orderId}`);
          if (stored) {
            currentPayment = JSON.parse(stored);
          } else {
            const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
            currentPayment = await createPayment(targetOrderId, 'UPI');
          }
        }

        setPayment(currentPayment);
        setLoading(false);

        if (currentPayment) {
          sseClient = new PaymentSseClient({
            paymentId: currentPayment.id,
            timeoutMs: 15000,
            onUpdate: (updated) => {
              setPayment(updated);
              if (updated.status === 'SUCCESS') {
                router.push(`/checkout/${orderId}/success?paymentId=${updated.id}`);
              } else if (updated.status === 'FAILED') {
                router.push(`/checkout/${orderId}/failed?paymentId=${updated.id}&code=${updated.errorCode || ''}&desc=${encodeURIComponent(updated.errorDescription || '')}`);
              }
            },
            onTimeoutOrError: (reason) => {
              console.warn('SSE stream disconnected or timed out:', reason);
              router.push(`/checkout/${orderId}/uncertain?paymentId=${currentPayment?.id || ''}`);
            },
          });

          sseClient.connect();
        }
      } catch (err) {
        console.warn('Error fetching UPI payment details:', err);
        const mockPay: PaymentResponse = {
          id: 'pay_upi_mock_123',
          orderId: orderId,
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: 50000,
          currency: 'INR',
          status: 'PENDING',
          method: 'UPI',
          intentUri: 'upi://pay?pa=merchant@fastpay&pn=FastPay%20Store&am=500.00&tr=upi_ref_123&cu=INR',
          qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        };
        setPayment(mockPay);
        setLoading(false);
      }
    };

    initPayment();

    return () => {
      if (sseClient) {
        sseClient.close();
      }
    };
  }, [orderId, paymentIdParam, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 text-sm">Generating UPI QR Code & Intent...</p>
        </div>
      </div>
    );
  }

  const intentUri = payment?.intentUri || 'upi://pay?pa=merchant@fastpay&pn=FastPay%20Store&am=500.00&tr=upi_ref_123&cu=INR';
  const qrBase64 = payment?.qrCodeBase64;

  return (
    <div className="min-h-screen pb-12">
      <Header amountPaise={payment?.amount || 50000} orderId={orderId} />

      <main className="max-w-xl mx-auto px-4">
        <button
          onClick={() => router.push(`/checkout/${orderId}`)}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change Payment Method</span>
        </button>

        <Card className="text-center py-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Badge variant="emerald" className="px-3 py-1">
              <span className="animate-ping h-2 w-2 rounded-full bg-emerald-400 mr-2 inline-block" />
              Live SSE Status Stream
            </Badge>
          </div>

          <h2 className="text-lg font-bold text-slate-100">Scan QR or Choose UPI App</h2>
          <p className="text-xs text-slate-400 mt-1">Open your UPI app on mobile or scan the QR code below.</p>

          <div className="my-6 flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-slate-800 relative inline-block">
              {qrBase64 ? (
                <img
                  src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-900 rounded flex items-center justify-center text-slate-500 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center space-x-2 text-xs text-emerald-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 mt-6">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-300 font-semibold mb-3">
              <Smartphone className="h-4 w-4 text-violet-400" />
              <span>Paying from Mobile Device?</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={intentUri}
                className="py-3 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center justify-center space-y-1 transition-all active:scale-95"
              >
                <span className="text-emerald-400 font-bold">GPay</span>
                <span className="text-[10px] text-slate-400">Open App</span>
              </a>

              <a
                href={intentUri}
                className="py-3 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center justify-center space-y-1 transition-all active:scale-95"
              >
                <span className="text-violet-400 font-bold">PhonePe</span>
                <span className="text-[10px] text-slate-400">Open App</span>
              </a>

              <a
                href={intentUri}
                className="py-3 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center justify-center space-y-1 transition-all active:scale-95"
              >
                <span className="text-teal-400 font-bold">BHIM</span>
                <span className="text-[10px] text-slate-400">Open App</span>
              </a>
            </div>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Intent payments do not require VPA input (Razorpay Direct standard)</span>
        </div>
      </main>
    </div>
  );
}
