'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { RefundModal } from '../../../../components/refund-modal/RefundModal';
import { getPayment, getRefunds, PaymentResponse, RefundResponse } from '../../../../lib/api';
import { ArrowLeft, RefreshCw, CheckCircle2, Clock, XCircle, ShieldCheck, FileText } from 'lucide-react';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params?.paymentId as string;

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!paymentId) return;

    Promise.all([
      getPayment(paymentId).catch(() => null),
      getRefunds(paymentId).catch(() => []),
    ])
      .then(([payData, refundData]) => {
        if (payData) {
          setPayment(payData);
        } else {
          // Fallback mock payment object
          setPayment({
            id: paymentId,
            orderId: 'ord_11111111-1111-1111-1111-111111111111',
            merchantId: '11111111-1111-1111-1111-111111111111',
            amount: 50000,
            currency: 'INR',
            status: 'SUCCESS',
            method: 'UPI',
            provider: 'MOCK_PROVIDER',
            createdAt: new Date().toISOString(),
          });
        }
        setRefunds(refundData || []);
      })
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handleRefundCreated = (newRefund: RefundResponse) => {
    setRefunds((prev) => [newRefund, ...prev]);
    // Refresh payment details to show updated refund status
    getPayment(paymentId)
      .then(setPayment)
      .catch((err) => console.warn('Could not refresh payment after refund:', err));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-slate-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const paymentStatus = payment?.status || 'SUCCESS';
  // State Machine Gating Rule: Refund button visible ONLY for SUCCESS or PARTIALLY_REFUNDED statuses
  const canRefund = paymentStatus === 'SUCCESS' || paymentStatus === 'PARTIALLY_REFUNDED';

  const totalRefundedPaise = refunds
    .filter((r) => r.status === 'REFUNDED' || r.status === 'PARTIALLY_REFUNDED' || r.status === 'REFUND_PENDING')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const amountPaise = payment?.amount || 50000;
  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: payment?.currency || 'INR',
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => router.push('/dashboard/payments')}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Payments Directory</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-100">{paymentId}</h1>
            <Badge variant="emerald">{paymentStatus}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Order Ref: {payment?.orderId || 'N/A'}</p>
        </div>

        {/* State Machine Gated Refund Action Button */}
        {canRefund ? (
          <Button
            variant="secondary"
            onClick={() => setIsRefundModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            <span>Issue Refund</span>
          </Button>
        ) : (
          <div className="text-xs text-slate-500 font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            Refund Not Allowed ({paymentStatus})
          </div>
        )}
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Payment Amount</p>
          <p className="text-2xl font-extrabold brand-gradient-text mt-1">{formattedAmount}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Method & Gateway</p>
          <p className="text-lg font-bold text-slate-100 mt-1">{payment?.method || 'UPI'} ({payment?.provider || 'FASTPAY'})</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Refunded</p>
          <p className="text-lg font-bold text-violet-400 mt-1">
            ₹{(totalRefundedPaise / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Payment Lifecycle Timeline */}
      <Card>
        <h2 className="font-bold text-slate-100 text-sm mb-4">Transaction Timeline</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Order Created</span>
          </div>
          <div className="h-px w-8 bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Payment Initiated</span>
          </div>
          <div className="h-px w-8 bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Gateway Auth</span>
          </div>
          <div className="h-px w-8 bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            {paymentStatus === 'SUCCESS' || (paymentStatus as string) === 'SUCCEEDED' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span className="font-semibold text-slate-200">{paymentStatus}</span>
          </div>
        </div>
      </Card>

      {/* Screen 5: Refunds History Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-100 text-sm">Refunds History</h2>
          <span className="text-xs text-slate-500 font-mono">{refunds.length} Refund Attempt(s)</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Refund ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Idempotency Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No refunds issued for this payment yet.
                  </td>
                </tr>
              ) : (
                refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-mono text-violet-400 font-medium">{ref.id.slice(0, 14)}...</td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      ₹{(ref.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="violet">{ref.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{ref.reason || 'CUSTOMER_REQUEST'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {ref.idempotencyKey ? ref.idempotencyKey.slice(0, 16) + '...' : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Refund Modal */}
      {payment && (
        <RefundModal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          paymentId={payment.id}
          originalAmountPaise={payment.amount}
          existingRefundsTotalPaise={totalRefundedPaise}
          onRefundCreated={handleRefundCreated}
        />
      )}
    </div>
  );
}
