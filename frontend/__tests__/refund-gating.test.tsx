import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentDetailPage from '../app/dashboard/payments/[paymentId]/page';
import * as api from '../lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ paymentId: 'pay_fail_200' }),
}));

jest.mock('../lib/api', () => ({
  getPayment: jest.fn().mockResolvedValue({
    id: 'pay_fail_200',
    orderId: 'ord_fail_200',
    merchantId: '11111111-1111-1111-1111-111111111111',
    amount: 50000,
    currency: 'INR',
    status: 'FAILED',
    method: 'CARD',
  }),
  getRefunds: jest.fn().mockResolvedValue([]),
}));

describe('FastPay Merchant Dashboard — State Machine Refund Gating Test', () => {
  test('Refund button is hidden/disabled when payment status is FAILED', async () => {
    render(<PaymentDetailPage />);

    // Wait for payment detail page to load
    expect(await screen.findByText('pay_fail_200')).toBeInTheDocument();

    // Assert "Issue Refund" action button is NOT rendered for FAILED payments
    expect(screen.queryByText('Issue Refund')).not.toBeInTheDocument();
    expect(screen.getByText(/Refund Not Allowed/i)).toBeInTheDocument();
  });
});
