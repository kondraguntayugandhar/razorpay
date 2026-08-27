package com.thirdprd.payment.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.exception.ResourceNotFoundException;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.dto.OrderResponse;
import com.thirdprd.payment.order.entity.Order;
import com.thirdprd.payment.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderResponse createOrder(UUID merchantId, CreateOrderRequest request) {
        String notesJson = null;
        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            try {
                notesJson = objectMapper.writeValueAsString(request.getNotes());
            } catch (JsonProcessingException e) {
                notesJson = "{}";
            }
        }

        Order order = Order.builder()
                .merchantId(merchantId)
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .status(OrderStatus.CREATED)
                .receipt(request.getReceipt())
                .notes(notesJson)
                .build();

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID merchantId, UUID orderId) {
        Order order = orderRepository.findByIdAndMerchantId(orderId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return mapToResponse(order);
    }

    public Order getOrderEntity(UUID merchantId, UUID orderId) {
        return orderRepository.findByIdAndMerchantId(orderId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    }

    public OrderResponse mapToResponse(Order order) {
        Map<String, Object> notesMap = null;
        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            try {
                notesMap = objectMapper.readValue(order.getNotes(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ignored) {
            }
        }

        return OrderResponse.builder()
                .id(order.getId())
                .merchantId(order.getMerchantId())
                .customerId(order.getCustomerId())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .receipt(order.getReceipt())
                .notes(notesMap)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
