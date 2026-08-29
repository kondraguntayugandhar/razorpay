package com.thirdprd.payment.invoice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_id", nullable = false, unique = true)
    private String invoiceId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;

    @Column(nullable = false)
    private Long subtotal;

    @Column(nullable = false)
    private Long discount = 0L;

    @Column(nullable = false)
    private Long tax = 0L;

    @Column(nullable = false)
    private Long total;

    @Column(nullable = false)
    private String currency = "INR";

    @Column(nullable = false)
    private String status = "DRAFT";

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate = LocalDate.now();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Invoice() {}

    public Invoice(UUID id, String invoiceId, UUID merchantId, UUID customerId, String invoiceNumber, Long subtotal, Long discount, Long tax, Long total, String currency, String status, LocalDate issueDate, LocalDate dueDate, String notes, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.merchantId = merchantId;
        this.customerId = customerId;
        this.invoiceNumber = invoiceNumber;
        this.subtotal = subtotal;
        this.discount = discount != null ? discount : 0L;
        this.tax = tax != null ? tax : 0L;
        this.total = total;
        this.currency = currency != null ? currency : "INR";
        this.status = status != null ? status : "DRAFT";
        this.issueDate = issueDate != null ? issueDate : LocalDate.now();
        this.dueDate = dueDate;
        this.notes = notes;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getSubtotal() { return subtotal; }
    public void setSubtotal(Long subtotal) { this.subtotal = subtotal; }

    public Long getTotal() { return total; }
    public void setTotal(Long total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public static InvoiceBuilder builder() { return new InvoiceBuilder(); }

    public static class InvoiceBuilder {
        private UUID id;
        private String invoiceId;
        private UUID merchantId;
        private UUID customerId;
        private String invoiceNumber;
        private Long subtotal;
        private Long discount = 0L;
        private Long tax = 0L;
        private Long total;
        private String currency = "INR";
        private String status = "DRAFT";
        private LocalDate issueDate = LocalDate.now();
        private LocalDate dueDate;
        private String notes;

        public InvoiceBuilder id(UUID id) { this.id = id; return this; }
        public InvoiceBuilder invoiceId(String invoiceId) { this.invoiceId = invoiceId; return this; }
        public InvoiceBuilder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public InvoiceBuilder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
        public InvoiceBuilder subtotal(Long subtotal) { this.subtotal = subtotal; return this; }
        public InvoiceBuilder total(Long total) { this.total = total; return this; }
        public InvoiceBuilder status(String status) { this.status = status; return this; }
        public InvoiceBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }

        public Invoice build() {
            return new Invoice(id, invoiceId, merchantId, customerId, invoiceNumber, subtotal, discount, tax, total, currency, status, issueDate, dueDate, notes, Instant.now(), Instant.now());
        }
    }
}
