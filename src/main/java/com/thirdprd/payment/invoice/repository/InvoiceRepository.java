package com.thirdprd.payment.invoice.repository;

import com.thirdprd.payment.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByMerchantId(UUID merchantId);
}
