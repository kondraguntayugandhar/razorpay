'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export default function CardPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params?.orderId as string) || 'demo';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/checkout/${orderId}/processing?method=CARD`);
  };

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col min-h-[672px]">


        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
          <button onClick={() => router.push(`/checkout/${orderId}`)} className="text-gray-700 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-base text-gray-900">Enter card details</h2>
        </div>

        <form onSubmit={handleCardPayment} className="flex-1 flex flex-col justify-between">
          <div className="p-5 space-y-4">
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
              <span className="font-extrabold text-sm text-gray-900">₹7,000</span>
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
                  required
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
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name on card"
                className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
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
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Pay ₹7,000</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
