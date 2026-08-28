'use client';

import React, { useEffect, useState } from 'react';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { PaymentsTable } from '../../components/payments-table/PaymentsTable';
import { Card } from '../../components/ui/Card';
import { searchAnalyticsPayments, PaymentResponse } from '../../lib/api';
import { DollarSign, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch payments list from analytics search or backend fallback
    searchAnalyticsPayments()
      .then((docs) => {
        if (docs && docs.length > 0) {
          const mapped: PaymentResponse[] = docs.map((doc: any) => ({
            id: doc.id || doc.paymentId || 'pay_001',
            orderId: doc.orderId || 'ord_001',
            merchantId: doc.merchantId || '11111111-1111-1111-1111-111111111111',
            amount: doc.amount || 50000,
            currency: doc.currency || 'INR',
            status: (doc.status as any) || 'SUCCESS',
            method: doc.method || 'UPI',
            provider: doc.provider || 'MOCK_PROVIDER',
            createdAt: doc.timestamp || doc.createdAt || new Date().toISOString(),
          }));
          setPayments(mapped);
        } else {
          // Default initial records if database has no rows yet
          setPayments([
            {
              id: 'pay_demo_succeeded_001',
              orderId: 'ord_demo_001',
              merchantId: '11111111-1111-1111-1111-111111111111',
              amount: 50000,
              currency: 'INR',
              status: 'SUCCESS',
              method: 'UPI',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'pay_demo_processing_002',
              orderId: 'ord_demo_002',
              merchantId: '11111111-1111-1111-1111-111111111111',
              amount: 120000,
              currency: 'INR',
              status: 'PROCESSING',
              method: 'CARD',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((err) => {
        console.warn('Error loading dashboard analytics:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Naive client-side aggregation over payments
  const totalVolumePaise = payments
    .filter((p) => p.status === 'SUCCESS' || (p.status as string) === 'SUCCEEDED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formattedVolume = (totalVolumePaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const succeededCount = payments.filter((p) => p.status === 'SUCCESS' || (p.status as string) === 'SUCCEEDED').length;
  const processingCount = payments.filter((p) => p.status === 'PROCESSING' || (p.status as string) === 'PENDING').length;
  const failedCount = payments.filter((p) => p.status === 'FAILED').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Merchant Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time payment volume and transaction status summary</p>
        </div>

        <Link
          href="/dashboard/payments"
          className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>View All Payments</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Successful Volume"
          value={formattedVolume}
          subtitle="Captured funds today"
          icon={DollarSign}
          variant="emerald"
        />
        <MetricCard
          title="Succeeded Payments"
          value={succeededCount}
          subtitle="Completed transactions"
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Processing / Pending"
          value={processingCount}
          subtitle="In-flight authorizations"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Failed Payments"
          value={failedCount}
          subtitle="Declined / expired"
          icon={XCircle}
          variant="rose"
        />
      </div>

      {/* Recent Payments Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-100 text-base">Recent Transactions</h2>
          <span className="text-xs text-slate-500 font-mono">Real-Time Sync</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading transactions...</div>
        ) : (
          <PaymentsTable payments={payments.slice(0, 5)} />
        )}
      </Card>
    </div>
  );
}
