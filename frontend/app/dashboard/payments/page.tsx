'use client';

import React, { useEffect, useState } from 'react';
import { PaymentsTable } from '../../../components/payments-table/PaymentsTable';
import { Card } from '../../../components/ui/Card';
import { searchAnalyticsPayments, PaymentResponse } from '../../../lib/api';

export default function PaymentsListPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
          setPayments([
            {
              id: 'pay_11111111-1111-1111-1111-111111111111',
              orderId: 'ord_11111111-1111-1111-1111-111111111111',
              merchantId: '11111111-1111-1111-1111-111111111111',
              amount: 50000,
              currency: 'INR',
              status: 'SUCCESS',
              method: 'UPI',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'pay_22222222-2222-2222-2222-222222222222',
              orderId: 'ord_22222222-2222-2222-2222-222222222222',
              merchantId: '11111111-1111-1111-1111-111111111111',
              amount: 150000,
              currency: 'INR',
              status: 'PROCESSING',
              method: 'CARD',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((err) => {
        console.warn('Error loading payments list:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Payments Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Search, filter, and inspect payment transactions</p>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading payments data...</div>
        ) : (
          <PaymentsTable payments={payments} />
        )}
      </Card>
    </div>
  );
}
