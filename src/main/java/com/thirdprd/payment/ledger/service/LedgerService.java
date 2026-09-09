package com.thirdprd.payment.ledger.service;

import com.thirdprd.payment.ledger.entity.LedgerEntry;
import com.thirdprd.payment.ledger.repository.LedgerRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.refund.entity.Refund;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);

    private final LedgerRepository ledgerRepository;

    public LedgerService(LedgerRepository ledgerRepository) {
        this.ledgerRepository = ledgerRepository;
    }

    /**
     * Record double-entry balanced ledger entries for a successful payment.
     * Generates:
     * 1. CREDIT: Gross Payment Volume
     * 2. FEE: Payment Processing Fee
     * 3. TAX: GST on Processing Fee (18%)
     * 4. NET_SETTLEMENT: Net funds credited to merchant balance
     */
    @Transactional
    public List<LedgerEntry> recordPaymentSuccess(Payment payment, BigDecimal feePercent) {
        if (payment == null || payment.getId() == null) {
            return List.of();
        }

        // Avoid duplicate ledger entries for the same payment
        List<LedgerEntry> existing = ledgerRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId());
        if (!existing.isEmpty()) {
            log.info("[LEDGER] Ledger entries already exist for payment {}, skipping duplicate creation", payment.getId());
            return existing;
        }

        UUID merchantId = payment.getMerchantId();
        Long grossPaise = payment.getAmount();
        BigDecimal effectiveFeeRate = feePercent != null ? feePercent : BigDecimal.valueOf(0.018); // Default 1.8%

        long feePaise = BigDecimal.valueOf(grossPaise)
                .multiply(effectiveFeeRate)
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        long gstPaise = BigDecimal.valueOf(feePaise)
                .multiply(BigDecimal.valueOf(0.18)) // 18% GST on processing fee
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        long netPaise = grossPaise - feePaise - gstPaise;

        Long currentBalance = ledgerRepository.calculateNetMerchantBalance(merchantId);
        long balanceAfter = (currentBalance != null ? currentBalance : 0L) + netPaise;

        String corrId = "corr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        // 1. Gross Credit
        LedgerEntry creditEntry = LedgerEntry.builder()
                .ledgerEntryId("led_cr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14))
                .merchantId(merchantId)
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .type("CREDIT")
                .amount(grossPaise)
                .fee(0L)
                .gst(0L)
                .netAmount(grossPaise)
                .currency(payment.getCurrency() != null ? payment.getCurrency() : "INR")
                .balanceAfter(balanceAfter)
                .description("Customer payment authorized gross credit")
                .correlationId(corrId)
                .createdAt(Instant.now())
                .build();

        // 2. Processing Fee
        LedgerEntry feeEntry = LedgerEntry.builder()
                .ledgerEntryId("led_fee_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14))
                .merchantId(merchantId)
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .type("FEE")
                .amount(feePaise)
                .fee(feePaise)
                .gst(0L)
                .netAmount(-feePaise)
                .currency(payment.getCurrency() != null ? payment.getCurrency() : "INR")
                .balanceAfter(balanceAfter)
                .description("Payment gateway processing fee")
                .correlationId(corrId)
                .createdAt(Instant.now())
                .build();

        // 3. GST Tax on Fee
        LedgerEntry taxEntry = LedgerEntry.builder()
                .ledgerEntryId("led_tax_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14))
                .merchantId(merchantId)
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .type("TAX")
                .amount(gstPaise)
                .fee(0L)
                .gst(gstPaise)
                .netAmount(-gstPaise)
                .currency(payment.getCurrency() != null ? payment.getCurrency() : "INR")
                .balanceAfter(balanceAfter)
                .description("GST (18%) on payment processing fee")
                .correlationId(corrId)
                .createdAt(Instant.now())
                .build();

        // 4. Net Settlement Entry
        LedgerEntry netEntry = LedgerEntry.builder()
                .ledgerEntryId("led_net_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14))
                .merchantId(merchantId)
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .type("NET_SETTLEMENT")
                .amount(netPaise)
                .fee(feePaise)
                .gst(gstPaise)
                .netAmount(netPaise)
                .currency(payment.getCurrency() != null ? payment.getCurrency() : "INR")
                .balanceAfter(balanceAfter)
                .description("Net settlement credit to merchant account")
                .correlationId(corrId)
                .createdAt(Instant.now())
                .build();

        List<LedgerEntry> savedEntries = ledgerRepository.saveAll(List.of(creditEntry, feeEntry, taxEntry, netEntry));
        log.info("[LEDGER] Recorded 4 balanced ledger entries for payment {}: gross={}, fee={}, gst={}, net={}",
                payment.getId(), grossPaise, feePaise, gstPaise, netPaise);

        return savedEntries;
    }

    /**
     * Record refund debit entry in ledger.
     */
    @Transactional
    public LedgerEntry recordRefund(Refund refund) {
        if (refund == null || refund.getId() == null) {
            return null;
        }

        List<LedgerEntry> existing = ledgerRepository.findByRefundIdOrderByCreatedAtAsc(refund.getId());
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        UUID merchantId = refund.getMerchantId();
        Long currentBalance = ledgerRepository.calculateNetMerchantBalance(merchantId);
        long balanceAfter = (currentBalance != null ? currentBalance : 0L) - refund.getAmount();

        String corrId = "corr_ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        LedgerEntry debitEntry = LedgerEntry.builder()
                .ledgerEntryId("led_ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14))
                .merchantId(merchantId)
                .paymentId(refund.getPaymentId())
                .refundId(refund.getId())
                .type("REFUND_DEBIT")
                .amount(refund.getAmount())
                .fee(0L)
                .gst(0L)
                .netAmount(-refund.getAmount())
                .currency(refund.getCurrency() != null ? refund.getCurrency() : "INR")
                .balanceAfter(balanceAfter)
                .description("Customer refund debit: " + (refund.getReason() != null ? refund.getReason() : "Customer refund"))
                .correlationId(corrId)
                .createdAt(Instant.now())
                .build();

        LedgerEntry saved = ledgerRepository.save(debitEntry);
        log.info("[LEDGER] Recorded refund debit entry {} for refund {}: amount={}",
                saved.getLedgerEntryId(), refund.getId(), refund.getAmount());
        return saved;
    }

    @Transactional(readOnly = true)
    public Long getMerchantBalance(UUID merchantId) {
        Long balance = ledgerRepository.calculateNetMerchantBalance(merchantId);
        return balance != null ? balance : 0L;
    }

    @Transactional(readOnly = true)
    public List<LedgerEntry> getLedgerEntries(UUID merchantId) {
        return ledgerRepository.findByMerchantIdOrderByCreatedAtAsc(merchantId);
    }
}
