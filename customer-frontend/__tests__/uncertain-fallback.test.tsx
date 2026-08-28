import { PaymentSseClient } from '../lib/sse';
import { getPayment } from '../lib/api';

jest.mock('../lib/api', () => {
  const original = jest.requireActual('../lib/api');
  return {
    ...original,
    getPayment: jest.fn().mockResolvedValue({
      id: 'pay_uncertain_999',
      orderId: 'ord_uncertain_999',
      amount: 50000,
      currency: 'INR',
      status: 'PENDING',
      method: 'UPI',
    }),
  };
});

describe('FastPay Frontend — Uncertain State Fallback Test (SSE Disconnect -> 5s Polling)', () => {
  test('Simulated SSE connection timeout triggers onTimeoutOrError callback', (done) => {
    const onUpdateMock = jest.fn();
    const onTimeoutMock = jest.fn((reason?: string) => {
      expect(reason).toContain('timeout');
      done();
    });

    const sseClient = new PaymentSseClient({
      paymentId: 'pay_uncertain_999',
      timeoutMs: 150,
      onUpdate: onUpdateMock,
      onTimeoutOrError: onTimeoutMock,
    });

    sseClient.connect();
  });
});
