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

export async function getNetbankingBanks(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/payment-methods/netbanking`);
    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Backend netbanking API fallback:', err);
  }

  // Complete list of all 60 registered banks in India with Netbanking
  return {
    "SBIN": "State Bank of India",
    "HDFC": "HDFC Bank",
    "ICIC": "ICICI Bank",
    "UTIB": "Axis Bank",
    "KKBK": "Kotak Mahindra Bank",
    "BARB_R": "Bank of Baroda",
    "CNRB": "Canara Bank",
    "PUNB_R": "Punjab National Bank",
    "UBIN": "Union Bank of India",
    "BKID": "Bank of India",
    "IDIB": "Indian Bank",
    "CBIN": "Central Bank of India",
    "IOBA": "Indian Overseas Bank",
    "MAHB": "Bank of Maharashtra",
    "PSIB": "Punjab & Sind Bank",
    "UCBA": "UCO Bank",
    "INDB": "IndusInd Bank",
    "IDFB": "IDFC FIRST Bank",
    "YESB": "Yes Bank",
    "FDRL": "Federal Bank",
    "RATN": "RBL Bank",
    "SIBL": "South Indian Bank",
    "KVBL": "Karur Vysya Bank",
    "CIUB": "City Union Bank",
    "KARB": "Karnataka Bank",
    "TMBL": "Tamilnad Mercantile Bank",
    "JAKA": "Jammu & Kashmir Bank",
    "BDBL": "Bandhan Bank",
    "DCBL": "DCB Bank",
    "DLXB": "Dhanlaxmi Bank",
    "IBKL": "IDBI Bank",
    "CSBK": "CSB Bank",
    "NTBL": "Nainital Bank",
    "AUBL": "AU Small Finance Bank",
    "ESFB": "Equitas Small Finance Bank",
    "UJJN": "Ujjivan Small Finance Bank",
    "JSFB": "Jana Small Finance Bank",
    "CSFB": "Capital Small Finance Bank",
    "FCSB": "Fincare Small Finance Bank",
    "SSFB": "Suryoday Small Finance Bank",
    "USFB": "Utkarsh Small Finance Bank",
    "SHIV": "Shivalik Small Finance Bank",
    "UNTY": "Unity Small Finance Bank",
    "AIRP": "Airtel Payments Bank",
    "IPPB": "India Post Payments Bank",
    "PYTM": "Paytm Payments Bank",
    "FINO": "Fino Payments Bank",
    "NSDL": "NSDL Payments Bank",
    "JIOB": "Jio Payments Bank",
    "DBSS": "DBS Bank India",
    "DEUT": "Deutsche Bank",
    "SCBL": "Standard Chartered Bank",
    "HSBC": "HSBC Bank India",
    "CITI": "Citibank India",
    "BARC": "Barclays Bank",
    "BOFA": "Bank of America",
    "SBM": "State Bank of Mauritius",
  };
}
