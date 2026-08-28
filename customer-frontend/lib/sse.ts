import { PaymentResponse, getPayment } from './api';

export interface SseOptions {
  paymentId: string;
  onUpdate: (payment: PaymentResponse) => void;
  onTimeoutOrError: (errorReason?: string) => void;
  timeoutMs?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class PaymentSseClient {
  private eventSource: EventSource | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private isTerminalReached: boolean = false;

  constructor(private options: SseOptions) {}

  public connect(): void {
    const { paymentId, onUpdate, onTimeoutOrError, timeoutMs = 15000 } = this.options;

    // 1. Initial State Sync on Connect via GET fallback in case terminal event fired prior to stream open
    getPayment(paymentId)
      .then((payment) => {
        if (payment) {
          onUpdate(payment);
          if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
            this.isTerminalReached = true;
            this.close();
            return;
          }
        }
      })
      .catch((err) => {
        console.warn('Initial GET status sync warning:', err);
      });

    // 2. Setup configurable timeout timer
    this.timeoutTimer = setTimeout(() => {
      if (!this.isTerminalReached) {
        console.warn(`SSE stream timeout reached (${timeoutMs}ms) without terminal status`);
        this.close();
        onTimeoutOrError('SSE stream timeout without terminal status update');
      }
    }, timeoutMs);

    // 3. Establish SSE EventSource Connection
    try {
      const url = `${BASE_URL}/api/v1/payments/${paymentId}/stream`;
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        this.handleRawData(event.data);
      };

      this.eventSource.addEventListener('payment-status', (event: any) => {
        this.handleRawData(event.data);
      });

      this.eventSource.onerror = (err) => {
        console.warn('SSE EventSource error encountered:', err);
        if (!this.isTerminalReached) {
          this.close();
          onTimeoutOrError('SSE connection error / disconnected');
        }
      };
    } catch (err: any) {
      console.error('Failed to create EventSource:', err);
      if (!this.isTerminalReached) {
        onTimeoutOrError(err?.message || 'Failed to initialize EventSource');
      }
    }
  }

  private handleRawData(rawData: string): void {
    try {
      const data: PaymentResponse = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      if (data && data.status) {
        this.options.onUpdate(data);
        if (data.status === 'SUCCESS' || data.status === 'FAILED') {
          this.isTerminalReached = true;
          this.close();
        }
      }
    } catch (e) {
      console.warn('Failed to parse SSE payload:', rawData, e);
    }
  }

  public close(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
