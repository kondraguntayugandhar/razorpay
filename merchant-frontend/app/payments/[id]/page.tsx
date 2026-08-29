'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getPayment, PaymentResponse } from '../../../lib/api';
import { ArrowLeft, Download, RotateCcw, AlertCircle } from 'lucide-react';

export default function PaymentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const paymentId = (params?.id as string) || 'pay_FP839201';
  const queryStatus = searchParams?.get('status');

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getPayment(paymentId)
      .then((data) => {
        setPayment(data);
      })
      .catch(() => {
        setPayment({
          id: paymentId,
          orderId: 'order_K9v1',
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: 1245000,
          currency: 'INR',
          status: (queryStatus as any) || 'CAPTURED',
          method: 'UPI',
          vpa: 'rahul@okaxis',
          createdAt: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, [paymentId, queryStatus]);

  const currentStatus = payment?.status || (queryStatus as string) || 'CAPTURED';
  const isRefundable = currentStatus === 'SUCCESS' || currentStatus === 'CAPTURED' || currentStatus === 'PARTIALLY_REFUNDED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-mono">{paymentId}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                currentStatus === 'CAPTURED' || currentStatus === 'SUCCESS'
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : currentStatus === 'FAILED'
                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                  : currentStatus === 'REFUNDED'
                  ? 'text-purple-700 bg-purple-50 border border-purple-200'
                  : 'text-amber-700 bg-amber-50 border border-amber-200'
              }`}>
                ● {currentStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Created on Oct 24, 2026, 14:32:01 IST</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs">
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Download Receipt</span>
          </button>

          {/* Refund Button Conditional Gating: Allowed only for SUCCESS, CAPTURED, PARTIALLY_REFUNDED */}
          {isRefundable ? (
            <button className="px-3.5 py-2 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 flex items-center space-x-1.5 shadow-2xs cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Issue Refund</span>
            </button>
          ) : (
            <button
              disabled
              title={`Refunds not permitted for payment status: ${currentStatus}`}
              className="px-3.5 py-2 border border-gray-200 text-gray-400 rounded-xl text-xs font-bold bg-gray-100 flex items-center space-x-1.5 cursor-not-allowed opacity-60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Issue Refund ({currentStatus})</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP SUMMARY BANNER CARD IN BOX SHAPE */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Amount Charged</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1">₹12,450.00</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Order ID: <span className="font-mono text-gray-800 font-bold">order_K9v1</span></p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
          <p className="text-gray-500">Method: <span className="font-bold text-gray-900">UPI (Google Pay)</span></p>
          <p className="text-gray-500">VPA: <span className="font-mono text-gray-800">rahul@okaxis</span></p>
          <p className="text-gray-500">Settlement Status: <span className="font-bold text-amber-600">Pending Settlement</span></p>
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CUSTOMER CARD */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">Customer Information</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base shrink-0">
              RJ
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Rahul Jain</p>
              <p className="text-xs text-gray-500">rahul@example.com</p>
              <p className="text-xs text-gray-500">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* TIMELINE CARD */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">Payment Timeline</h3>
          <div className="space-y-4 pl-2 relative border-l-2 border-emerald-500 text-xs">
            <div className="relative pl-4">
              <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></span>
              <p className="font-bold text-gray-900">Payment Status: {currentStatus}</p>
              <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:05</p>
            </div>

            <div className="relative pl-4">
              <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></span>
              <p className="font-bold text-gray-900">UPI Auth Approved</p>
              <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:02</p>
            </div>

            <div className="relative pl-4">
              <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-gray-400 border-2 border-white"></span>
              <p className="font-bold text-gray-900">Transaction Initiated</p>
              <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:01</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
