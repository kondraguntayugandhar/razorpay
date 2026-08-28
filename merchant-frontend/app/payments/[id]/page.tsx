'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Bell, Download, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function PaymentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = (params?.id as string) || 'pay_FP839201';

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-2 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col min-h-[672px]">


        {/* HEADER */}
        <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="text-gray-700 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Payment</p>
              <h1 className="text-sm font-bold font-mono text-gray-900">{paymentId}</h1>
            </div>
          </div>
          <button className="relative text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <main className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* AMOUNT BANNER */}
          <div className="p-4 border border-blue-100 rounded-2xl bg-blue-50/30 text-center space-y-2 shadow-2xs">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs font-mono text-gray-500">Payment ID: {paymentId}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                SUCCESSFUL
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900">₹2,499.00</h2>

            {/* ACTION BUTTONS ROW */}
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 bg-white shadow-2xs flex items-center space-x-1 hover:bg-gray-50">
                <Download className="w-3 h-3 text-gray-500" />
                <span>Receipt</span>
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 bg-white shadow-2xs flex items-center space-x-1 hover:bg-gray-50">
                <RotateCcw className="w-3 h-3 text-gray-500" />
                <span>Refund</span>
              </button>
              <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors">
                Capture
              </button>
            </div>
          </div>

          {/* PAYMENT DETAILS CARD */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white space-y-3 text-xs shadow-2xs">
            <h3 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-2">Payment Details</h3>

            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Order ID</span>
              <span className="font-mono text-gray-800">order_FP998421</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Method</span>
              <span className="font-bold text-gray-900">UPI (Google Pay)</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Created Date</span>
              <span className="text-gray-600">Oct 24, 2026, 14:32:01 IST</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Settlement Status</span>
              <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                Pending Settlement
              </span>
            </div>
          </div>

          {/* CUSTOMER CARD */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white space-y-3 text-xs shadow-2xs">
            <h3 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-2">Customer</h3>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                RS
              </div>
              <div>
                <p className="font-bold text-gray-900">Rahul Sharma</p>
                <p className="text-gray-400 text-[11px]">rahul@example.com</p>
              </div>
            </div>
          </div>

          {/* PAYMENT TIMELINE */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white space-y-3 text-xs shadow-2xs">
            <h3 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-2">Payment Timeline</h3>

            <div className="space-y-3 pl-2 relative border-l-2 border-emerald-500">
              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></span>
                <p className="font-bold text-gray-900">Captured</p>
                <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:05</p>
              </div>

              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></span>
                <p className="font-bold text-gray-900">Successful</p>
                <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:04</p>
              </div>

              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></span>
                <p className="font-bold text-gray-900">UPI Selected</p>
                <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:02</p>
              </div>

              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></span>
                <p className="font-bold text-gray-900">Initiated</p>
                <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:01</p>
              </div>

              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-gray-400 border-2 border-white"></span>
                <p className="font-bold text-gray-900">Created</p>
                <p className="text-[10px] text-gray-400">Oct 24, 2026, 14:32:01</p>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
