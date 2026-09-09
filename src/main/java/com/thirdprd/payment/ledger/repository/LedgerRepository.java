package com.thirdprd.payment.ledger.repository;

import com.thirdprd.payment.ledger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerRepository extends JpaRepository<LedgerEntry, UUID> {

    List<LedgerEntry> findByMerchantIdOrderByCreatedAtAsc(UUID merchantId);

    List<LedgerEntry> findByPaymentIdOrderByCreatedAtAsc(UUID paymentId);

    List<LedgerEntry> findByRefundIdOrderByCreatedAtAsc(UUID refundId);

    Optional<LedgerEntry> findByLedgerEntryId(String ledgerEntryId);

    @Query("SELECT COALESCE(SUM(l.netAmount), 0) FROM LedgerEntry l WHERE l.merchantId = :merchantId")
    Long calculateNetMerchantBalance(@Param("merchantId") UUID merchantId);

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM LedgerEntry l WHERE l.merchantId = :merchantId AND l.type IN ('CREDIT', 'NET_SETTLEMENT')")
    Long calculateTotalCredits(@Param("merchantId") UUID merchantId);

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM LedgerEntry l WHERE l.merchantId = :merchantId AND l.type IN ('DEBIT', 'FEE', 'TAX', 'REFUND_DEBIT')")
    Long calculateTotalDebits(@Param("merchantId") UUID merchantId);
}
