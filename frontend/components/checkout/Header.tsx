import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

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
    <div className="w-full bg-slate-950/60 backdrop-blur-md border-b border-slate-800 py-4 px-6 mb-6">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-violet-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-slate-100 tracking-tight">FastPay</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">Checkout</span>
            </div>
            <p className="text-xs text-slate-400">{merchantName}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Amount</p>
          <p className="text-2xl font-extrabold brand-gradient-text">{formattedAmount}</p>
          {orderId && (
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Order: {orderId.slice(0, 8)}...</p>
          )}
        </div>
      </div>
    </div>
  );
};
