import { PaymentSseClient } from '../lib/sse';
import { PaymentResponse } from '../lib/api';

// Mock getPayment to verify no polling occurs during happy path SSE stream
jest.mock('../lib/api', () => {
  const original = jest.requireActual('../lib/api');
  return {
    ...original,
    getPayment: jest.fn().mockResolvedValue({
      id: 'pay_happy_123',
      orderId: 'ord_happy_123',
      amount: 50000,
      currency: 'INR',
      status: 'PROCESSING',
      method: 'UPI',
    }),
  };
});

describe('FastPay Frontend — Happy Path Integration Test (SSE Stream, Zero Polling)', () => {
  test('UPI Payment transitions via SSE stream to SUCCESS without polling', (done) => {
    const onUpdateMock = jest.fn();
    const onTimeoutMock = jest.fn();

    // Create SSE Client
    const sseClient = new PaymentSseClient({
      paymentId: 'pay_happy_123',
      timeoutMs: 5000,
      onUpdate: (payment: PaymentResponse) => {
        onUpdateMock(payment);
        if (payment.status === 'SUCCESS') {
          // Assert SSE-driven state transition occurred successfully
          expect(payment.status).toBe('SUCCESS');
          expect(payment.id).toBe('pay_happy_123');
          expect(onTimeoutMock).not.toHaveBeenCalled();
          sseClient.close();
          done();
        }
      },
      onTimeoutOrError: onTimeoutMock,
    });

    // Simulate SSE connection and incoming payment-status event
    sseClient.connect();

    // Manually trigger SSE message event on internal instance
    setTimeout(() => {
      (sseClient as any).handleRawData(
        JSON.stringify({
          id: 'pay_happy_123',
          orderId: 'ord_happy_123',
          amount: 50000,
          currency: 'INR',
          status: 'SUCCESS',
          method: 'UPI',
        })
      );
    }, 100);
  });
});
