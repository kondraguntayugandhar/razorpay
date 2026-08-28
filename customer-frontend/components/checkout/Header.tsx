import React from 'react';
import { FastPayLogo } from '../ui/FastPayLogo';

interface HeaderProps {
  amountPaise: number;
  currency?: string;
  orderId?: string;
  merchantName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  amountPaise,
  currency = 'INR',
  orderId,
  merchantName = 'FastPay Merchant Store',
}) => {
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  });

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3.5 px-6 mb-6 shadow-2xs">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FastPayLogo size="md" />
          <div className="hidden sm:block pl-2 border-l border-gray-200">
            <p className="text-xs text-gray-500 font-medium">{merchantName}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Amount</p>
          <p className="text-xl font-bold text-gray-900">{formattedAmount}</p>
          {orderId && (
            <p className="text-[10px] text-gray-400 font-mono">Order: {orderId.slice(0, 8)}...</p>
          )}
        </div>
      </div>
    </div>
  );
};
