const MERCHANT_KEY_STORAGE = 'fastpay_merchant_key';
const DEFAULT_KEY = 'rzp_test_acme_key_001';

export function getMerchantKey(): string {
  if (typeof window !== 'undefined') {
    const key = sessionStorage.getItem(MERCHANT_KEY_STORAGE);
    if (key) return key;
  }
  return DEFAULT_KEY;
}

export function setMerchantKey(key: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(MERCHANT_KEY_STORAGE, key);
  }
}

export function logoutMerchant(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(MERCHANT_KEY_STORAGE);
  }
}
