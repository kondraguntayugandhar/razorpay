'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getPayment, PaymentResponse } from '../../../../lib/api';
import { Lock } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = (params?.orderId as string) || 'demo';
  const paymentIdParam = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);

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
            amount: 700000,
            currency: 'INR',
            status: 'SUCCESS',
            provider: 'MOCK_PROVIDER',
            providerPaymentId: 'pay_success_123',
            method: 'UPI',
          });
        });
    }
  }, [paymentIdParam, orderId]);

  const amountPaise = payment?.amount || 700000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  const nowFormatted = new Date().toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col p-6 min-h-[600px] justify-between">

        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
          {/* Success Checkmark Circle */}
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-4 text-2xl font-bold">
            ✓
          </div>

          <h1 className="text-xl font-bold text-gray-900">Payment Successful</h1>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1 mb-6">{formattedAmount}</h2>

          {/* Receipt Details Box */}
          <div className="w-full bg-blue-50/40 border border-blue-100 rounded-2xl p-4 text-xs space-y-3 font-sans text-left mb-6">
            <div className="flex items-center justify-between text-gray-600">
              <span className="text-gray-500 font-medium">Merchant</span>
              <span className="font-bold text-gray-900">Acme Store</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="text-gray-500 font-medium">Payment Method</span>
              <span className="font-bold text-gray-900 flex items-center space-x-1">
                <span>⚡</span>
                <span>{payment?.method || 'UPI'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-600 font-mono">
              <span className="text-gray-500 font-sans font-medium">Txn ID</span>
              <span className="text-gray-900 font-bold">FP_TXN_{payment?.id?.slice(-6).toUpperCase() || '839381'}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="text-gray-500 font-medium">Date / Time</span>
              <span className="text-gray-700 font-medium text-[11px]">{nowFormatted}</span>
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={() => router.push(`/checkout/${orderId}`)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
          >
            Done
          </button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 pt-4 border-t border-gray-100">
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
    </div>
  );
}
