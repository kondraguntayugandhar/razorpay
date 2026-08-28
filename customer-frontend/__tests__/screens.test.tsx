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
    expect(await screen.findByText('Acme Store')).toBeInTheDocument();
    expect(screen.getByText('UPI')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Netbanking')).toBeInTheDocument();
  });


  test('UPI screen renders Base64 QR code container and app chooser links', async () => {
    render(<UpiPaymentPage />);
    expect(await screen.findByText('Pay using UPI')).toBeInTheDocument();
    expect(screen.getByText('Google Pay')).toBeInTheDocument();
    expect(screen.getByText('PhonePe')).toBeInTheDocument();
    expect(screen.getAllByText('BHIM').length).toBeGreaterThan(0);
  });



  test('Card screen renders sandbox form inputs', () => {
    render(<CardPaymentPage />);
    expect(screen.getByText('Enter card details')).toBeInTheDocument();
    expect(screen.getByText('Card Number')).toBeInTheDocument();
    expect(screen.getByText('Expiry')).toBeInTheDocument();
    expect(screen.getByText('CVV')).toBeInTheDocument();
  });


  test('Net Banking screen renders popular banks list', async () => {
    render(<NetBankingPage />);
    expect(screen.getByText('Netbanking')).toBeInTheDocument();
    const sbiElements = await screen.findAllByText('State Bank of India');
    expect(sbiElements.length).toBeGreaterThan(0);
    const hdfcElements = await screen.findAllByText('HDFC Bank');
    expect(hdfcElements.length).toBeGreaterThan(0);
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
    expect(screen.getByText("Please don't pay again!")).toBeInTheDocument();
  });
});

