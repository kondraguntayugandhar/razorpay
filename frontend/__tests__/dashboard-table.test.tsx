import React from 'react';
import { render, screen } from '@testing-library/react';
import { PaymentsTable } from '../components/payments-table/PaymentsTable';
import { PaymentResponse } from '../lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('FastPay Merchant Dashboard — Payments Table Component Tests', () => {
  const mockPayments: PaymentResponse[] = [
    {
      id: 'pay_succ_100',
      orderId: 'ord_succ_100',
      merchantId: '11111111-1111-1111-1111-111111111111',
      amount: 50000,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'UPI',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_fail_200',
      orderId: 'ord_fail_200',
      merchantId: '11111111-1111-1111-1111-111111111111',
      amount: 120000,
      currency: 'INR',
      status: 'FAILED',
      method: 'CARD',
      createdAt: new Date().toISOString(),
    },
  ];

  test('PaymentsTable renders payment records with ID, amount, and status badges', () => {
    render(<PaymentsTable payments={mockPayments} />);

    expect(screen.getByText(/pay_succ_100/i)).toBeInTheDocument();
    expect(screen.getByText(/pay_fail_200/i)).toBeInTheDocument();
    expect(screen.getAllByText('SUCCEEDED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0);
  });
});
