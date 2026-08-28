'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createPayment, getPayment, PaymentResponse } from '../../../../lib/api';
import { PaymentSseClient } from '../../../../lib/sse';
import { ArrowLeft, Lock } from 'lucide-react';

export default function UpiPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = (params?.orderId as string) || 'demo';
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [vpaInput, setVpaInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [upiQrData, setUpiQrData] = useState<string>('upi://pay?pa=merchant@upi&pn=Acme%20Store&am=7000&cu=INR');

  useEffect(() => {
    let sseClient: PaymentSseClient | null = null;

    const initUpiSession = async () => {
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
        if (currentPayment?.intentUri) {
          setUpiQrData(currentPayment.intentUri);
        }

        if (currentPayment) {
          sseClient = new PaymentSseClient({
            paymentId: currentPayment.id,
            timeoutMs: 300000,
            onUpdate: (updated) => {
              setPayment(updated);
              if (updated.status === 'SUCCESS') {
                router.push(`/checkout/${orderId}/success?paymentId=${updated.id}`);
              } else if (updated.status === 'FAILED') {
                router.push(`/checkout/${orderId}/failed?paymentId=${updated.id}&code=${updated.errorCode || ''}&desc=${encodeURIComponent(updated.errorDescription || '')}`);
              }
            },
            onTimeoutOrError: () => {
              router.push(`/checkout/${orderId}/uncertain?paymentId=${currentPayment?.id || ''}`);
            },
          });

          sseClient.connect();
        }
      } catch (err) {
        console.warn('UPI page session setup error:', err);
      }
    };

    initUpiSession();

    return () => {
      if (sseClient) {
        sseClient.close();
      }
    };
  }, [orderId, paymentIdParam, router]);

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      const pay = await createPayment(targetOrderId, 'UPI', { vpa: vpaInput });
      router.push(`/checkout/${orderId}/processing?paymentId=${pay.id}`);
    } catch (err) {
      router.push(`/checkout/${orderId}/processing?paymentId=${payment?.id || 'pay_upi_demo_001'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiQrData)}`;

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col min-h-[672px]">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
          <button onClick={() => router.push(`/checkout/${orderId}`)} className="text-gray-700 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-base text-gray-900">Pay using UPI</h2>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Recommended UPI Apps (2x2 Grid) */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3">Recommended UPI Apps</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePay}
                className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  G
                </div>
                <span className="text-xs font-semibold text-gray-800">Google Pay</span>
              </button>

              <button
                onClick={handlePay}
                className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  पे
                </div>
                <span className="text-xs font-semibold text-gray-800">PhonePe</span>
              </button>

              <button
                onClick={handlePay}
                className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  paytm
                </div>
                <span className="text-xs font-semibold text-gray-800">Paytm</span>
              </button>

              <button
                onClick={handlePay}
                className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                  BHIM
                </div>
                <span className="text-xs font-semibold text-gray-800">BHIM</span>
              </button>
            </div>
          </div>

          {/* Scan QR Code Box */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-500 mb-2.5">Scan QR Code</p>
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex flex-col items-center text-center">
              <div className="relative p-2 border border-gray-200 rounded-xl bg-white shadow-xs">
                <img src={qrImageUrl} alt="UPI QR Code" className="w-44 h-44 object-contain" />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Scan using any UPI app to pay</p>
            </div>
          </div>

          {/* Separator */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="shrink mx-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Enter UPI ID / VPA */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Enter UPI ID / VPA</label>
            <input
              type="text"
              value={vpaInput}
              onChange={(e) => setVpaInput(e.target.value)}
              placeholder="Ex: username@bank"
              className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex items-center space-x-1 mt-2 text-[11px] text-gray-500">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>Your connection is secure</span>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Blue Button */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <span>Pay ₹7,000</span>
            <Lock className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
