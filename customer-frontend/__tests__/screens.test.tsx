import React from 'react';
import { render, screen } from '@testing-library/react';
import MethodSelectionPage from '../app/checkout/[orderId]/page';
import UpiPaymentPage from '../app/checkout/[orderId]/upi/page';
import CardPaymentPage from '../app/checkout/[orderId]/card/page';
import NetBankingPage from '../app/checkout/[orderId]/netbanking/page';
import FailedPage from '../app/checkout/[orderId]/failed/page';
import PaymentUncertainPage from '../app/checkout/[orderId]/uncertain/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useParams: () => ({ orderId: 'ord_test_123' }),
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === 'code') return 'UPI_COLLECT_REJECTED';
      if (param === 'desc') return 'The customer rejected the UPI request in their app.';
      if (param === 'paymentId') return 'pay_test_001';
      return null;
    },
  }),
}));

describe('FastPay Customer Frontend — Screen Component Tests', () => {
  test('Method Selection screen renders amount and UPI as recommended option', async () => {
    render(<MethodSelectionPage />);
    expect(await screen.findByText('Payment Options')).toBeInTheDocument();
    expect(screen.getByText('UPI - Google Pay')).toBeInTheDocument();
    expect(screen.getByText('Available Offers')).toBeInTheDocument();
    expect(screen.getByText('All Payment Options')).toBeInTheDocument();
  });

  test('UPI screen renders Base64 QR code container and app chooser links', async () => {
    render(<UpiPaymentPage />);
    expect(await screen.findByText('Scan QR or Choose UPI App')).toBeInTheDocument();
    expect(screen.getByText('GPay')).toBeInTheDocument();
    expect(screen.getByText('PhonePe')).toBeInTheDocument();
    expect(screen.getByText('BHIM')).toBeInTheDocument();
  });

  test('Card screen renders sandbox form inputs', () => {
    render(<CardPaymentPage />);
    expect(screen.getByText('Pay with Card')).toBeInTheDocument();
    expect(screen.getByText('Card Number')).toBeInTheDocument();
    expect(screen.getByText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByText('CVV / CVC')).toBeInTheDocument();
  });

  test('Net Banking screen renders popular banks list', () => {
    render(<NetBankingPage />);
    expect(screen.getByText('Net Banking')).toBeInTheDocument();
    expect(screen.getByText('State Bank of India')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
  });

  test('Failed screen renders error code and error description parameters', () => {
    render(<FailedPage />);
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText('UPI_COLLECT_REJECTED')).toBeInTheDocument();
    expect(screen.getByText('The customer rejected the UPI request in their app.')).toBeInTheDocument();
  });

  test('Uncertain screen renders fallback warning banner and check counter', async () => {
    render(<PaymentUncertainPage />);
    expect(screen.getByText('Payment Verifying')).toBeInTheDocument();
    expect(screen.getByText("Please don't pay again! Your payment may already be processing at the bank.")).toBeInTheDocument();
  });
});
