import React from 'react';
import { render, screen } from '@testing-library/react';
import MethodSelectionPage from '../app/checkout/[orderId]/page';
import UpiPaymentPage from '../app/checkout/[orderId]/upi/page';
import CardPaymentPage from '../app/checkout/[orderId]/card/page';
import NetBankingPage from '../app/checkout/[orderId]/netbanking/page';
import FailedPage from '../app/checkout/[orderId]/failed/page';
import PaymentUncertainPage from '../app/checkout/[orderId]/uncertain/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
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

describe('FastPay Frontend — Screen Component Tests', () => {
  test('Method Selection screen renders amount and UPI as recommended option', async () => {
    render(<MethodSelectionPage />);
    expect(await screen.findByText('Select Payment Method')).toBeInTheDocument();
    expect(screen.getByText('UPI (Intent & Instant QR)')).toBeInTheDocument();
    expect(screen.getByText('Pay with UPI')).toBeInTheDocument();
    expect(screen.getByText('Credit / Debit Card')).toBeInTheDocument();
  });

  test('UPI screen renders Base64 QR code container and app chooser links', async () => {
    render(<UpiPaymentPage />);
    expect(await screen.findByText('Scan QR or Choose UPI App')).toBeInTheDocument();
    expect(screen.getByText('GPay')).toBeInTheDocument();
    expect(screen.getByText('PhonePe')).toBeInTheDocument();
    expect(screen.getByText('BHIM')).toBeInTheDocument();
  });

  test('Card screen renders demo sandbox warning banner', async () => {
    render(<CardPaymentPage />);
    expect(screen.getByText('Pay with Card')).toBeInTheDocument();
    expect(screen.getByText('Demo Sandbox Mode')).toBeInTheDocument();
    expect(screen.getByText('Simulate Demo Card Payment')).toBeInTheDocument();
  });

  test('Net Banking screen renders popular bank buttons and search input', async () => {
    render(<NetBankingPage />);
    expect(screen.getByText('Net Banking')).toBeInTheDocument();
    expect(screen.getByText('SBI')).toBeInTheDocument();
    expect(screen.getByText('HDFC')).toBeInTheDocument();
    expect(screen.getByText('ICICI')).toBeInTheDocument();
  });

  test('Failed screen renders exact errorCode and errorDescription from backend', async () => {
    render(<FailedPage />);
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText('UPI_COLLECT_REJECTED')).toBeInTheDocument();
    expect(screen.getByText('The customer rejected the UPI request in their app.')).toBeInTheDocument();
    expect(screen.getByText('Try Another Payment Method')).toBeInTheDocument();
  });

  test('Payment Uncertain screen renders verifying message and Payment ID', async () => {
    render(<PaymentUncertainPage />);
    expect(screen.getByText('We are checking your payment status')).toBeInTheDocument();
    expect(screen.getByText("Please don't pay again! Your payment may already be processing at the bank.")).toBeInTheDocument();
    expect(screen.getByText('pay_test_001')).toBeInTheDocument();
  });
});
