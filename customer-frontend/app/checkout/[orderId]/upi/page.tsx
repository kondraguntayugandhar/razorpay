'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getOrder, createPayment, getPayment, PaymentResponse } from '../../../../lib/api';
import { PaymentSseClient } from '../../../../lib/sse';
import { ArrowLeft, Lock, AlertCircle, Clock } from 'lucide-react';

const FIVE_MINUTES_SECONDS = 300; // 5 minutes = 300 seconds

export default function UpiPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = (params?.orderId as string) || 'demo';
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [vpaInput, setVpaInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderAmountPaise, setOrderAmountPaise] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`order_amount_${orderId}`);
      if (stored) return parseInt(stored, 10);
      const storedPay = sessionStorage.getItem(`payment_${orderId}`);
      if (storedPay) {
        try {
          const parsed = JSON.parse(storedPay);
          if (parsed.amount) return parsed.amount;
        } catch (e) {}
      }
    }
    return 700000;
  });

  const [upiQrData, setUpiQrData] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('upiQrData');
      if (stored) return stored;
    }
    return 'upi://pay?pa=merchant@upi&pn=Acme%20Store&cu=INR';
  });

  const [timeLeft, setTimeLeft] = useState<number>(FIVE_MINUTES_SECONDS);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | null>(null);

  const handleSelectApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim') => {
    setSelectedApp(app);
    const amtRupees = ((payment?.amount || orderAmountPaise || 700000) / 100).toFixed(2);
    let sampleVpa = '';
    if (app === 'gpay') sampleVpa = 'customer@okhdfcbank';
    else if (app === 'phonepe') sampleVpa = 'customer@ybl';
    else if (app === 'paytm') sampleVpa = 'customer@paytm';
    else if (app === 'bhim') sampleVpa = 'customer@upi';

    setVpaInput(sampleVpa);
    setUpiQrData(`upi://pay?pa=${encodeURIComponent(sampleVpa)}&pn=Acme%20Store&am=${amtRupees}&cu=INR`);
  };

  const handleVpaChange = (val: string) => {
    setVpaInput(val);
    const amtRupees = ((payment?.amount || orderAmountPaise || 700000) / 100).toFixed(2);
    const pa = val.trim() || 'merchant@upi';
    setUpiQrData(`upi://pay?pa=${encodeURIComponent(pa)}&pn=Acme%20Store&am=${amtRupees}&cu=INR`);
  };

  // Authoritative 5-minute expiry timer calculation
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

    const initUpiSession = async () => {
      try {
        let currentAmount = orderAmountPaise;
        if (orderId && orderId !== 'demo') {
          try {
            const ord = await getOrder(orderId);
            if (ord?.amount) {
              currentAmount = ord.amount;
              setOrderAmountPaise(ord.amount);
              sessionStorage.setItem(`order_amount_${orderId}`, String(ord.amount));
            }
          } catch (e) {}
        }

        let currentPayment: PaymentResponse | null = null;

        if (paymentIdParam) {
          currentPayment = await getPayment(paymentIdParam);
        } else {
          const stored = sessionStorage.getItem(`payment_${orderId}`);
          if (stored) {
            currentPayment = JSON.parse(stored);
          } else {
            const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
            currentPayment = await createPayment(targetOrderId, 'UPI', { amount: currentAmount });
          }
        }

        setPayment(currentPayment);
        const resolvedAmount = currentPayment?.amount || currentAmount || 700000;
        if (currentPayment?.intentUri) {
          setUpiQrData(currentPayment.intentUri);
        } else {
          const amtRupees = (resolvedAmount / 100).toFixed(2);
          const generatedUri = `upi://pay?pa=merchant@upi&pn=Acme%20Store&am=${amtRupees}&cu=INR`;
          setUpiQrData(generatedUri);
        }

        if (currentPayment) {
          sseClient = new PaymentSseClient({
            paymentId: currentPayment.id,
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
    if (isExpired) return;
    setSubmitting(true);
    const amountToPay = payment?.amount || orderAmountPaise || 700000;
    try {
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      const pay = await createPayment(targetOrderId, 'UPI', { vpa: vpaInput, amount: amountToPay });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`payment_${orderId}`, JSON.stringify(pay));
        sessionStorage.setItem(`payment_${pay.id}`, JSON.stringify(pay));
      }
      router.push(`/checkout/${orderId}/processing?paymentId=${pay.id}`);
    } catch (err) {
      const fallbackPay = payment || {
        id: `pay_upi_${Date.now()}`,
        orderId,
        merchantId: '11111111-1111-1111-1111-111111111111',
        amount: amountToPay,
        currency: 'INR',
        status: 'PROCESSING',
        method: 'UPI',
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`payment_${orderId}`, JSON.stringify(fallbackPay));
        sessionStorage.setItem(`payment_${fallbackPay.id}`, JSON.stringify(fallbackPay));
      }
      router.push(`/checkout/${orderId}/processing?paymentId=${fallbackPay.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiQrData)}`;

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col min-h-[672px]">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push(`/checkout/${orderId}`)} className="text-gray-700 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-base text-gray-900">Pay using UPI</h2>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs font-mono font-bold text-blue-900">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{isExpired ? '00:00' : formattedTimer}</span>
          </div>
        </div>

        {isExpired ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Payment Session Expired</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              This checkout session has expired after 5 minutes. Payment actions are disabled.
            </p>
            <button
              onClick={() => router.push(`/checkout/${orderId}`)}
              className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              Generate New Link
            </button>
          </div>
        ) : (
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Recommended UPI Apps (2x2 Grid) */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-3">Recommended UPI Apps</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectApp('gpay')}
                  className={`p-3.5 border rounded-xl transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs ${
                    selectedApp === 'gpay'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                      : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    G
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Google Pay</span>
                  {selectedApp === 'gpay' && (
                    <span className="text-[10px] text-blue-600 font-bold">Selected</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectApp('phonepe')}
                  className={`p-3.5 border rounded-xl transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs ${
                    selectedApp === 'phonepe'
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/30'
                      : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    पे
                  </div>
                  <span className="text-xs font-semibold text-gray-800">PhonePe</span>
                  {selectedApp === 'phonepe' && (
                    <span className="text-[10px] text-purple-600 font-bold">Selected</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectApp('paytm')}
                  className={`p-3.5 border rounded-xl transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs ${
                    selectedApp === 'paytm'
                      ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/30'
                      : 'border-gray-200 bg-white hover:border-sky-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                    paytm
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Paytm</span>
                  {selectedApp === 'paytm' && (
                    <span className="text-[10px] text-sky-600 font-bold">Selected</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectApp('bhim')}
                  className={`p-3.5 border rounded-xl transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs ${
                    selectedApp === 'bhim'
                      ? 'border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/30'
                      : 'border-gray-200 bg-white hover:border-orange-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                    BHIM
                  </div>
                  <span className="text-xs font-semibold text-gray-800">BHIM</span>
                  {selectedApp === 'bhim' && (
                    <span className="text-[10px] text-orange-600 font-bold">Selected</span>
                  )}
                </button>
              </div>
            </div>

            {/* Scan QR Code Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold text-gray-500">Scan QR Code</p>
                {selectedApp && (
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Active: {selectedApp.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs flex flex-col items-center text-center">
                <div className="relative p-2 border border-gray-200 rounded-xl bg-white shadow-xs">
                  <img src={qrImageUrl} alt="UPI QR Code" className="w-44 h-44 object-contain" />
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">Scan using any UPI app to pay</p>
                <p className="text-[10px] text-gray-400 font-mono mt-1 break-all max-w-[280px]">
                  {upiQrData}
                </p>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">Enter UPI ID / VPA</label>
                {vpaInput && (
                  <button
                    type="button"
                    onClick={() => handleVpaChange('')}
                    className="text-[10px] text-gray-400 hover:text-red-500 transition-colors font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                value={vpaInput}
                onChange={(e) => handleVpaChange(e.target.value)}
                placeholder="Ex: username@bank"
                className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex items-center space-x-1 mt-2 text-[11px] text-gray-500">
                <Lock className="w-3 h-3 text-gray-400" />
                <span>QR code and intent automatically sync with entered UPI ID</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Sticky Blue Button */}
        {!isExpired && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={handlePay}
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>Pay {((payment?.amount || orderAmountPaise || 700000) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
              <Lock className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
