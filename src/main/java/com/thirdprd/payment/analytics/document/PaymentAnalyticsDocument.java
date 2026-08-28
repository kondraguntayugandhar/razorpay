package com.thirdprd.payment.analytics.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;

@Document(indexName = "payment_analytics")
public class PaymentAnalyticsDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String paymentId;

    @Field(type = FieldType.Keyword)
    private String merchantId;

    @Field(type = FieldType.Long)
    private Long amount;

    @Field(type = FieldType.Keyword)
    private String currency;

    @Field(type = FieldType.Keyword)
    private String status;

    @Field(type = FieldType.Keyword)
    private String provider;

    @Field(type = FieldType.Keyword)
    private String method;

    @Field(type = FieldType.Text)
    private String receipt;

    @Field(type = FieldType.Date)
    private Instant createdAt;

    public PaymentAnalyticsDocument() {
    }

    public PaymentAnalyticsDocument(String id, String paymentId, String merchantId, Long amount, String currency, String status, String provider, String method, String receipt, Instant createdAt) {
        this.id = id;
        this.paymentId = paymentId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.provider = provider;
        this.method = method;
        this.receipt = receipt;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String paymentId;
        private String merchantId;
        private Long amount;
        private String currency;
        private String status;
        private String provider;
        private String method;
        private String receipt;
        private Instant createdAt = Instant.now();

        public Builder id(String id) { this.id = id; return this; }
        public Builder paymentId(String paymentId) { this.paymentId = paymentId; return this; }
        public Builder merchantId(String merchantId) { this.merchantId = merchantId; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder provider(String provider) { this.provider = provider; return this; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder receipt(String receipt) { this.receipt = receipt; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public PaymentAnalyticsDocument build() {
            return new PaymentAnalyticsDocument(id, paymentId, merchantId, amount, currency, status, provider, method, receipt, createdAt);
        }
    }
}
