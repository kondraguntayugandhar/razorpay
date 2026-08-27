package com.thirdprd.payment.payment.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.common.exception.ResourceNotFoundException;
import com.thirdprd.payment.order.entity.Order;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.order.service.OrderService;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.entity.PaymentEvent;
import com.thirdprd.payment.payment.repository.PaymentEventRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;
import com.thirdprd.payment.statemachine.PaymentStateMachine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final PaymentProvider paymentProvider;
    private final PaymentStateMachine stateMachine;
    private final ObjectMapper objectMapper;

    public PaymentService(OrderService orderService, OrderRepository orderRepository, PaymentRepository paymentRepository, PaymentEventRepository paymentEventRepository, PaymentProvider paymentProvider, PaymentStateMachine stateMachine, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.paymentEventRepository = paymentEventRepository;
        this.paymentProvider = paymentProvider;
        this.stateMachine = stateMachine;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PaymentResponse createPayment(UUID merchantId, String idempotencyKey, CreatePaymentRequest request) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Payment> existingPayment = paymentRepository.findByMerchantIdAndIdempotencyKey(merchantId, idempotencyKey);
            if (existingPayment.isPresent()) {
                return mapToResponse(existingPayment.get());
            }
        }

        Order order = orderService.getOrderEntity(merchantId, request.getOrderId());

        if (order.getStatus() == OrderStatus.PAID) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Order has already been paid");
        }

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .merchantId(merchantId)
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .status(PaymentStatus.CREATED)
                .method(request.getMethod())
                .idempotencyKey(idempotencyKey)
                .provider(paymentProvider.getProviderName())
                .build();

        payment = paymentRepository.save(payment);
        recordEvent(payment.getId(), null, PaymentStatus.CREATED, "Payment record initialized");

        // Transition CREATED -> PROCESSING
        transitionPaymentStatus(payment, PaymentStatus.PROCESSING, "Initiating payment with gateway provider");

        Map<String, Object> notesMap = request.getNotes();
        if (notesMap == null && order.getNotes() != null && !order.getNotes().isBlank()) {
            try {
                notesMap = objectMapper.readValue(order.getNotes(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ignored) {
            }
        }

        PaymentRequest providerRequest = PaymentRequest.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .merchantId(merchantId)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod())
                .notes(notesMap)
                .build();

        ProviderResponse providerResponse = paymentProvider.createPayment(providerRequest);

        payment.setProviderPaymentId(providerResponse.getProviderPaymentId());

        if (providerResponse.isSuccess()) {
            transitionPaymentStatus(payment, PaymentStatus.SUCCESS, "Payment authorized by provider");
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
        } else if (providerResponse.getStatus() == PaymentStatus.PENDING) {
            transitionPaymentStatus(payment, PaymentStatus.PENDING, "Payment pending provider completion");
        } else {
            payment.setErrorCode(providerResponse.getErrorCode());
            payment.setErrorDescription(providerResponse.getErrorDescription());
            transitionPaymentStatus(payment, PaymentStatus.FAILED, "Payment declined or failed at provider");
        }

        payment.setUpdatedAt(Instant.now());
        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(UUID merchantId, UUID paymentId) {
        Payment payment = paymentRepository.findByIdAndMerchantId(paymentId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        return mapToResponse(payment);
    }

    @Transactional
    public Payment processProviderStatusUpdate(String providerPaymentId, PaymentStatus targetStatus, String errorCode, String errorDescription, String reason) {
        Payment payment = paymentRepository.findByProviderPaymentId(providerPaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment with providerPaymentId", providerPaymentId));

        if (payment.getStatus() == targetStatus) {
            return payment;
        }

        PaymentStatus oldStatus = payment.getStatus();
        stateMachine.validateTransition(oldStatus, targetStatus);

        payment.setStatus(targetStatus);
        if (errorCode != null) payment.setErrorCode(errorCode);
        if (errorDescription != null) payment.setErrorDescription(errorDescription);
        payment.setUpdatedAt(Instant.now());

        Payment savedPayment = paymentRepository.save(payment);
        recordEvent(payment.getId(), oldStatus, targetStatus, reason);

        if (targetStatus == PaymentStatus.SUCCESS) {
            Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
            if (order != null && order.getStatus() != OrderStatus.PAID) {
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
            }
        }

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public List<Payment> findStuckPayments(List<PaymentStatus> statuses, Instant updatedBefore) {
        return paymentRepository.findByStatusIn(statuses).stream()
                .filter(p -> p.getUpdatedAt() != null && p.getUpdatedAt().isBefore(updatedBefore))
                .toList();
    }

    private void transitionPaymentStatus(Payment payment, PaymentStatus targetStatus, String reason) {
        PaymentStatus currentStatus = payment.getStatus();
        stateMachine.validateTransition(currentStatus, targetStatus);
        payment.setStatus(targetStatus);
        recordEvent(payment.getId(), currentStatus, targetStatus, reason);
    }

    private void recordEvent(UUID paymentId, PaymentStatus fromStatus, PaymentStatus toStatus, String reason) {
        PaymentEvent event = PaymentEvent.builder()
                .paymentId(paymentId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .reason(reason)
                .build();
        paymentEventRepository.save(event);
    }

    public PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .merchantId(payment.getMerchantId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .provider(payment.getProvider())
                .providerPaymentId(payment.getProviderPaymentId())
                .method(payment.getMethod())
                .errorCode(payment.getErrorCode())
                .errorDescription(payment.getErrorDescription())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
