import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration for FastPay Platform
export const options = {
  scenarios: {
    sustained_payment_load: {
      executor: 'constant-arrival-rate',
      rate: 50, // 50 requests per second
      timeUnit: '1s',
      duration: '1m', // 1 minute load run
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% error rate threshold
    http_req_duration: ['p(95)<250', 'p(99)<500'], // p95 < 250ms, p99 < 500ms
  },
};

const BASE_URL = 'http://localhost:8080/api/v1';

export default function () {
  const orderPayload = JSON.stringify({
    merchantId: '2441365e-670a-4957-b3cd-fdf7375c8474',
    amount: 10000, // ₹100.00
    currency: 'INR',
    receipt: `rcpt_${Math.floor(Math.random() * 1000000)}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'fp_live_test_api_key_839201',
    },
  };

  // 1. Create Order Request
  const orderRes = http.post(`${BASE_URL}/orders`, orderPayload, params);
  const orderSuccess = check(orderRes, {
    'Order created (200/201)': (r) => r.status === 200 || r.status === 201,
  });

  if (orderSuccess && orderRes.json() && orderRes.json().data) {
    const orderId = orderRes.json().data.orderId || orderRes.json().data.id;

    // 2. Process Payment Request
    const paymentPayload = JSON.stringify({
      orderId: orderId,
      merchantId: '2441365e-670a-4957-b3cd-fdf7375c8474',
      amount: 10000,
      currency: 'INR',
      method: 'UPI',
      vpa: 'success@upi',
      idempotencyKey: `idempotency_${Math.floor(Math.random() * 10000000)}`,
    });

    const paymentRes = http.post(`${BASE_URL}/payments`, paymentPayload, params);
    check(paymentRes, {
      'Payment processed (200/201)': (r) => r.status === 200 || r.status === 201,
    });
  }

  sleep(0.1);
}
