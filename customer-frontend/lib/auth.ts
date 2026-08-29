const MERCHANT_KEY_STORAGE = 'fastpay_merchant_key';

export function getMerchantKey(): string | null {
  if (typeof window !== 'undefined') {
    const key = sessionStorage.getItem(MERCHANT_KEY_STORAGE);
    if (key) return key;
  }
  return null;
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
