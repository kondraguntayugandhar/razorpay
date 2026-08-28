'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/Badge';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { PaymentResponse } from '../../lib/api';

interface PaymentsTableProps {
  payments: PaymentResponse[];
  onSelectPayment?: (payment: PaymentResponse) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, onSelectPayment }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.orderId && payment.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.method && payment.method.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'SUCCEEDED':
        return <Badge variant="emerald">SUCCEEDED</Badge>;
      case 'PROCESSING':
      case 'PENDING':
        return <Badge variant="amber">PROCESSING</Badge>;
      case 'FAILED':
        return <Badge variant="rose">FAILED</Badge>;
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
      case 'REFUND_PENDING':
        return <Badge variant="violet">{status}</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const handleRowClick = (payment: PaymentResponse) => {
    if (onSelectPayment) {
      onSelectPayment(payment);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search Payment ID or Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCEEDED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Payment ID</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80 text-xs">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No matching payment records found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const formattedAmount = (payment.amount / 100).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: payment.currency || 'INR',
                });

                return (
                  <tr
                    key={payment.id}
                    onClick={() => handleRowClick(payment)}
                    className="hover:bg-slate-900/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                      {payment.id.slice(0, 18)}...
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{formattedAmount}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(payment.status)}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{payment.method || 'UPI'}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'Just now'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-500 inline" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
