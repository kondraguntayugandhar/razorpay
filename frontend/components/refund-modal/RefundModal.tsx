'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { createRefund, RefundResponse } from '../../lib/api';
import { X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RefundModalProps {
  paymentId: string;
  originalAmountPaise: number;
  existingRefundsTotalPaise?: number;
  isOpen: boolean;
  onClose: () => void;
  onRefundCreated: (refund: RefundResponse) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  paymentId,
  originalAmountPaise,
  existingRefundsTotalPaise = 0,
  isOpen,
  onClose,
  onRefundCreated,
}) => {
  const remainingBalancePaise = Math.max(0, originalAmountPaise - existingRefundsTotalPaise);

  const [refundAmountRupees, setRefundAmountRupees] = useState<string>(
    (remainingBalancePaise / 100).toFixed(2)
  );
  const [reason, setReason] = useState<string>('CUSTOMER_REQUEST');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Single-click disable protection
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const amountPaise = Math.round(parseFloat(refundAmountRupees) * 100);

    if (isNaN(amountPaise) || amountPaise <= 0) {
      setError('Please enter a valid refund amount greater than ₹0.00');
      setSubmitting(false);
      return;
    }

    if (amountPaise > remainingBalancePaise) {
      setError(
        `Refund amount exceeds remaining refundable balance of ₹${(
          remainingBalancePaise / 100
        ).toFixed(2)}`
      );
      setSubmitting(false);
      return;
    }

    // 2. Client-side unique Idempotency-Key per submit action
    const clientKey = `ref_ui_${paymentId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    try {
      const response = await createRefund(paymentId, amountPaise, reason, clientKey);
      onRefundCreated(response);
      onClose();
    } catch (err: any) {
      console.error('Refund submission error:', err);
      setError(err?.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-md w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Issue Refund</h3>
            <p className="text-xs text-slate-400">Payment ID: {paymentId.slice(0, 14)}...</p>
          </div>
        </div>

        <div className="my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
          <span>Remaining Balance:</span>
          <span className="text-emerald-400 font-bold">
            ₹{(remainingBalancePaise / 100).toFixed(2)}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRefund} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Refund Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              max={(remainingBalancePaise / 100).toFixed(2)}
              value={refundAmountRupees}
              onChange={(e) => setRefundAmountRupees(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Refund Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="CUSTOMER_REQUEST">Customer Requested Refund</option>
              <option value="DUPLICATE_PAYMENT">Duplicate Payment</option>
              <option value="SERVICE_DEFECT">Service Defect / Cancellation</option>
            </select>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="w-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="secondary"
              isLoading={submitting}
              disabled={submitting}
              className="w-1/2"
            >
              Confirm Refund
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
