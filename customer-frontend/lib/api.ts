export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    description?: string;
  };
}

export interface OrderResponse {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  createdAt: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'PROCESSING' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_PENDING';
  provider?: string;
  providerPaymentId?: string;
  method?: string;
  errorCode?: string;
  errorDescription?: string;
  upiReferenceId?: string;
  vpa?: string;
  intentUri?: string;
  qrCodeBase64?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RefundResponse {
  id: string;
  paymentId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'REFUND_PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_FAILED';
  providerRefundId?: string;
  reason?: string;
  idempotencyKey?: string;
  errorCode?: string;
  errorDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DEFAULT_API_KEY = 'rzp_test_acme_key_001';

function getAuthHeader(customKey?: string): string {
  if (customKey) return `Bearer ${customKey}`;
  if (typeof window !== 'undefined') {
    const storedKey = sessionStorage.getItem('fastpay_merchant_key');
    if (storedKey) return `Bearer ${storedKey}`;
  }
  return `Bearer ${DEFAULT_API_KEY}`;
}

export async function createOrder(amountPaise: number, currency: string = 'INR', receipt: string = 'rcpt_001', apiKey?: string): Promise<OrderResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(apiKey),
    },
    body: JSON.stringify({ amount: amountPaise, currency, receipt }),
  });
  const json: ApiResponse<OrderResponse> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to create order');
  }
  return json.data;
}

export async function getOrder(orderId: string, apiKey?: string): Promise<OrderResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(apiKey),
    },
  });
  const json: ApiResponse<OrderResponse> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to fetch order');
  }
  return json.data;
}

export async function createPayment(
  orderId: string,
  method: string,
  extraParams: Record<string, any> = {},
  idempotencyKey?: string,
  apiKey?: string
): Promise<PaymentResponse> {
  const key = idempotencyKey || `idem_${orderId}_${method}_${Date.now()}`;
  const res = await fetch(`${BASE_URL}/api/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(apiKey),
      'Idempotency-Key': key,
    },
    body: JSON.stringify({
      orderId,
      method,
      ...extraParams,
    }),
  });
  const json: ApiResponse<PaymentResponse> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to initiate payment');
  }
  return json.data;
}

export async function getPayment(paymentId: string, apiKey?: string): Promise<PaymentResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(apiKey),
    },
  });
  const json: ApiResponse<PaymentResponse> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to fetch payment status');
  }
  return json.data;
}

export async function createRefund(
  paymentId: string,
  amountPaise: number,
  reason: string = 'CUSTOMER_REQUEST',
  idempotencyKey?: string,
  apiKey?: string
): Promise<RefundResponse> {
  const key = idempotencyKey || `ref_${paymentId}_${Date.now()}`;
  const res = await fetch(`${BASE_URL}/api/v1/payments/${paymentId}/refunds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(apiKey),
      'Idempotency-Key': key,
    },
    body: JSON.stringify({
      amount: amountPaise,
      reason,
    }),
  });
  const json: ApiResponse<RefundResponse> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to submit refund');
  }
  return json.data;
}

export async function getRefunds(paymentId: string, apiKey?: string): Promise<RefundResponse[]> {
  const res = await fetch(`${BASE_URL}/api/v1/payments/${paymentId}/refunds`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(apiKey),
    },
  });
  const json: ApiResponse<RefundResponse[]> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to fetch refund history');
  }
  return json.data;
}

export async function searchAnalyticsPayments(
  query?: string,
  merchantId?: string,
  status?: string,
  apiKey?: string
): Promise<any[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (merchantId) params.append('merchantId', merchantId);
  if (status) params.append('status', status);

  const res = await fetch(`${BASE_URL}/api/v1/analytics/payments/search?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(apiKey),
    },
  });
  const json: ApiResponse<any[]> = await res.json();
  if (!res.ok || !json.success) {
    return [];
  }
  return json.data || [];
}
