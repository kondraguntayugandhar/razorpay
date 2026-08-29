package com.thirdprd.payment.webhook.repository;

import com.thirdprd.payment.webhook.entity.MerchantWebhook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MerchantWebhookRepository extends JpaRepository<MerchantWebhook, UUID> {
    List<MerchantWebhook> findByMerchantId(UUID merchantId);
}
