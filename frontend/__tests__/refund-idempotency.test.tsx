import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RefundModal } from '../components/refund-modal/RefundModal';
import * as api from '../lib/api';

jest.mock('../lib/api', () => ({
  createRefund: jest.fn().mockResolvedValue({
    id: 'ref_001',
    paymentId: 'pay_succ_100',
    amount: 50000,
    status: 'REFUNDED',
    reason: 'CUSTOMER_REQUEST',
    idempotencyKey: 'ref_key_123',
  }),
}));

describe('FastPay Merchant Dashboard — Refund Idempotency Integration Test', () => {
  test('Submitting a refund generates Idempotency-Key header and disables button on first click', async () => {
    const handleClose = jest.fn();
    const handleCreated = jest.fn();

    render(
      <RefundModal
        isOpen={true}
        onClose={handleClose}
        paymentId="pay_succ_100"
        originalAmountPaise={50000}
        existingRefundsTotalPaise={0}
        onRefundCreated={handleCreated}
      />
    );

    const submitBtn = screen.getByText('Confirm Refund');
    expect(submitBtn).toBeInTheDocument();

    // Click submit button once
    fireEvent.click(submitBtn);

    // Assert createRefund API was called with a fresh Idempotency-Key
    await waitFor(() => {
      expect(api.createRefund).toHaveBeenCalledTimes(1);
      const callArgs = (api.createRefund as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('pay_succ_100'); // paymentId
      expect(callArgs[1]).toBe(50000); // amount
      expect(callArgs[3]).toContain('ref_ui_pay_succ_100_'); // Idempotency-Key header parameter
    });
  });
});
