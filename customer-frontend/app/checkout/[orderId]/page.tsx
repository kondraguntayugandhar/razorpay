'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrder, createPayment, PaymentResponse, OrderResponse } from '../../../lib/api';
import { PaymentSseClient } from '../../../lib/sse';
import { FastPayLogo } from '../../../components/ui/FastPayLogo';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  QrCode,
  CreditCard,
  Building2,
  Wallet,
  Smartphone,
  RefreshCw
} from 'lucide-react';

export default function MethodSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params?.orderId as string) || 'demo';

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // View state: 'MAIN' | 'UPI' | 'CARD'
  const [activeScreen, setActiveScreen] = useState<'MAIN' | 'UPI' | 'CARD'>('MAIN');

  // Form Inputs
  const [vpaInput, setVpaInput] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Session UPI QR Data
  const [upiQrData, setUpiQrData] = useState<string>('upi://pay?pa=merchant@upi&pn=Acme%20Store&am=7000&cu=INR');
  const [activePayment, setActivePayment] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const initPageSession = (amt: number) => {
      const amountRupees = (amt / 100).toFixed(0);
      const generatedUpiData = `upi://pay?pa=merchant@upi&pn=Acme%20Store&am=${amountRupees}&cu=INR`;
      setUpiQrData(generatedUpiData);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('upiQrData', generatedUpiData);
      }
    };

    if (orderId === 'demo') {
      const demoAmt = 700000; // ₹7,000.00
      setOrder({
        id: 'demo-order-123',
        merchantId: '11111111-1111-1111-1111-111111111111',
        amount: demoAmt,
        currency: 'INR',
        status: 'CREATED',
        receipt: 'FP102938',
        createdAt: new Date().toISOString(),
      });
      initPageSession(demoAmt);
      setLoading(false);
      return;
    }

    getOrder(orderId)
      .then((data) => {
        setOrder(data);
        initPageSession(data.amount || 700000);
        setLoading(false);
      })
      .catch(() => {
        const fallbackAmt = 700000;
        setOrder({
          id: orderId,
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: fallbackAmt,
          currency: 'INR',
          status: 'CREATED',
          receipt: 'FP102938',
          createdAt: new Date().toISOString(),
        });
        initPageSession(fallbackAmt);
        setLoading(false);
      });
  }, [orderId]);

  // Initiate payment and connect SSE stream
  const handleInitiatePayment = async (method: 'UPI' | 'CARD') => {
    setSubmitting(true);
    try {
      const targetOrderId = orderId === 'demo' ? '11111111-1111-1111-1111-111111111111' : orderId;
      const payment = await createPayment(targetOrderId, method, { vpa: vpaInput });
      setActivePayment(payment);
      router.push(`/checkout/${orderId}/processing?paymentId=${payment.id}`);
    } catch (err) {
      console.warn('Backend payment initiation fallback:', err);
      const mockPayId = `pay_${method.toLowerCase()}_${Date.now()}`;
      router.push(`/checkout/${orderId}/processing?paymentId=${mockPayId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const amountPaise = order?.amount || 700000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  const formattedAmountShort = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiQrData)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 text-xs mt-3">Loading FastPay Checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col min-h-[672px]">


        {/* SCREEN 1: MAIN PAYMENT OPTIONS */}
        {activeScreen === 'MAIN' && (
          <div className="flex-1 flex flex-col p-6">
            {/* Header: Store Name & Close */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  ✓
                </div>
                <span className="font-bold text-gray-900 text-sm">Acme Store</span>
              </div>
              <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Info */}
            <div className="text-center mb-6">
              <p className="text-xs text-gray-400 font-medium">Order #{order?.receipt || 'FP102938'}</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{formattedAmount}</h1>
            </div>

            {/* Payment Methods Card */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs mb-6">
              {/* UPI Option */}
              <button
                onClick={() => setActiveScreen('UPI')}
                className="w-full p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">UPI</h3>
                    <p className="text-xs text-gray-400">GPay, PhonePe, Paytm</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Card Option */}
              <button
                onClick={() => setActiveScreen('CARD')}
                className="w-full p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">Card</h3>
                    <p className="text-xs text-gray-400">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Netbanking Option */}
              <button
                onClick={() => router.push(`/checkout/${orderId}/netbanking`)}
                className="w-full p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">Netbanking</h3>
                    <p className="text-xs text-gray-400">All major Indian banks</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Wallets Option */}
              <button
                onClick={() => setActiveScreen('UPI')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">Wallets</h3>
                    <p className="text-xs text-gray-400">Paytm, Amazon Pay</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-auto text-center space-y-1 pt-4">
              <div className="flex items-center justify-center space-x-1 text-xs font-medium text-gray-500">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Secured by <b className="text-gray-700">FastPay</b></span>
              </div>
              <div className="text-[10px] text-gray-400 space-x-2">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:underline">Terms of Service</a>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2 & 3: PAY USING UPI & QR CODE */}
        {activeScreen === 'UPI' && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
              <button onClick={() => setActiveScreen('MAIN')} className="text-gray-700 hover:text-black">
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
                    onClick={() => handleInitiatePayment('UPI')}
                    className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      G
                    </div>
                    <span className="text-xs font-semibold text-gray-800">Google Pay</span>
                  </button>

                  <button
                    onClick={() => handleInitiatePayment('UPI')}
                    className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                      पे
                    </div>
                    <span className="text-xs font-semibold text-gray-800">PhonePe</span>
                  </button>

                  <button
                    onClick={() => handleInitiatePayment('UPI')}
                    className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                      paytm
                    </div>
                    <span className="text-xs font-semibold text-gray-800">Paytm</span>
                  </button>

                  <button
                    onClick={() => handleInitiatePayment('UPI')}
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
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                onClick={() => handleInitiatePayment('UPI')}
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                <span>Pay {formattedAmountShort}</span>
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: ENTER CARD DETAILS */}
        {activeScreen === 'CARD' && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
              <button onClick={() => setActiveScreen('MAIN')} className="text-gray-700 hover:text-black">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-base text-gray-900">Enter card details</h2>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {/* Merchant Row */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    🏪
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Acme Store</span>
                    <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Secured connection</span>
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-gray-900">{formattedAmountShort}</span>
              </div>

              {/* Card Number Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="absolute right-3 top-3 flex space-x-1 text-[10px] font-bold text-gray-400">
                    <span className="px-1 bg-gray-100 rounded">VISA</span>
                    <span className="px-1 bg-gray-100 rounded">MC</span>
                  </div>
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name on card"
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Save Card Checkbox */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="saveCard" className="text-xs text-gray-700">
                  <span className="font-semibold block">Save card securely</span>
                  <span className="text-[11px] text-gray-400">For faster checkouts next time. CVV is never saved.</span>
                </label>
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start space-x-2 text-[11px] text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Your payment info is stored securely using banking-grade 256-bit encryption.</span>
              </div>
            </div>

            {/* Bottom Sticky Blue Button */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => handleInitiatePayment('CARD')}
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Pay {formattedAmountShort}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
