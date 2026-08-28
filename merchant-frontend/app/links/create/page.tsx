'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../../../components/BottomNav';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function CreatePaymentLinkPage() {
  const router = useRouter();

  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('+91');
  const [allowPartial, setAllowPartial] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Payment Link created for ₹${amount}! Link copied to clipboard.`);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-2 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col pb-16 min-h-[672px]">


        {/* HEADER */}
        <header className="p-4 border-b border-gray-100 flex items-center space-x-3 bg-white sticky top-0 z-10">
          <button onClick={() => router.back()} className="text-gray-700 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-base text-gray-900">Create Payment Link</h1>
        </header>

        <form onSubmit={handleCreate} className="flex-1 flex flex-col justify-between p-5 overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* AMOUNT INPUT */}
            <div className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs text-center">
              <label className="block text-[10px] font-extrabold tracking-wider text-gray-400 uppercase mb-2">
                AMOUNT
              </label>
              <div className="flex items-center justify-center space-x-1 text-3xl font-extrabold text-gray-900">
                <span className="text-gray-400 font-normal">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-40 text-center font-extrabold focus:outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Premium subscription"
                className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* CUSTOMER DETAILS */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold text-gray-900">Customer Details</span>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* OPTIONS */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold text-gray-900">Options</span>

              {/* Allow Partial Payments */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white">
                <div>
                  <span className="font-semibold text-xs text-gray-900 block">Allow partial payments</span>
                  <span className="text-[10px] text-gray-400">Customer can pay in installments.</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowPartial}
                  onChange={(e) => setAllowPartial(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Expiry Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              Create Payment Link
            </button>
          </div>
        </form>

        <BottomNav activeTab="more" />
      </div>
    </div>
  );
}
