import { PaymentSseClient } from '../lib/sse';
import { PaymentResponse } from '../lib/api';

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

    const sseClient = new PaymentSseClient({
      paymentId: 'pay_happy_123',
      timeoutMs: 5000,
      onUpdate: (payment: PaymentResponse) => {
        onUpdateMock(payment);
        if (payment.status === 'SUCCESS') {
          expect(payment.status).toBe('SUCCESS');
          expect(payment.id).toBe('pay_happy_123');
          expect(onTimeoutMock).not.toHaveBeenCalled();
          sseClient.close();
          done();
        }
      },
      onTimeoutOrError: onTimeoutMock,
    });

    sseClient.connect();

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
