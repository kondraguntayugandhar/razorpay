'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CreatePaymentLinkPage() {
  const router = useRouter();

  const [amount, setAmount] = useState('4,500.00');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('+91');
  const [allowPartial, setAllowPartial] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Payment Link created for ₹${amount}! Link copied to clipboard.`);
    router.push('/links');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex items-center space-x-3">
        <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Payment Link</h1>
          <p className="text-xs text-gray-500 mt-0.5">Generate a shareable payment URL for custom orders or invoices.</p>
        </div>
      </div>

      {/* FORM IN BOX SHAPE CONTAINER */}
      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-6">
        {/* AMOUNT SECTION */}
        <div className="p-6 border border-gray-200 rounded-xl bg-gray-50/50 text-center space-y-2">
          <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
            PAYMENT AMOUNT
          </label>
          <div className="flex items-center justify-center space-x-1 text-4xl font-extrabold text-gray-900">
            <span className="text-gray-400">₹</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-52 text-center font-extrabold focus:outline-none bg-transparent"
              required
            />
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Description / Purpose</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Annual Consulting Retainer or Product Order #9910"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Customer Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Customer Phone (Optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* OPTIONS */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50">
          <div>
            <span className="font-bold text-xs text-gray-900 block">Allow Partial Payments</span>
            <span className="text-[11px] text-gray-500">Enable customers to make installment payments towards the total amount.</span>
          </div>
          <input
            type="checkbox"
            checked={allowPartial}
            onChange={(e) => setAllowPartial(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
          >
            Create & Copy Payment Link
          </button>
        </div>
      </form>
    </div>
  );
}
