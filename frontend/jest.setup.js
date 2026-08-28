require('@testing-library/jest-dom');

// Global fetch mock for JSDOM
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          id: 'ord_test_123',
          merchantId: '11111111-1111-1111-1111-111111111111',
          amount: 50000,
          currency: 'INR',
          status: 'CREATED',
        },
      }),
  })
);

// Mock EventSource globally for JSDOM environment using plain JS
global.EventSource = class MockEventSource {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onerror = null;
  }

  addEventListener() {}
  removeEventListener() {}
  close() {}
};
