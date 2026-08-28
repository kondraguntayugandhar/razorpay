package com.thirdprd.payment.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "payment.exchange";
    public static final String EXCHANGE_DLX = "payment.dlx";

    public static final String PAYMENT_EVENTS_QUEUE = "payment.events";
    public static final String WEBHOOK_EVENTS_QUEUE = "webhook.events";
    public static final String PAYMENT_EVENTS_DLQ = "payment.events.dlq";
    public static final String WEBHOOK_EVENTS_DLQ = "webhook.events.dlq";

    public static final String ROUTING_KEY_PAYMENT_CREATED = "payment.created";
    public static final String ROUTING_KEY_PAYMENT_SUCCEEDED = "payment.succeeded";
    public static final String ROUTING_KEY_PAYMENT_FAILED = "payment.failed";
    public static final String ROUTING_KEY_WEBHOOK_RECEIVED = "webhook.received";

    public static final String ROUTING_KEY_PAYMENT_DLQ = "payment.dlq.events";
    public static final String ROUTING_KEY_WEBHOOK_DLQ = "webhook.dlq.events";

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public TopicExchange paymentDlxExchange() {
        return new TopicExchange(EXCHANGE_DLX, true, false);
    }

    @Bean
    public Queue paymentEventsQueue() {
        return QueueBuilder.durable(PAYMENT_EVENTS_QUEUE)
                .withArgument("x-dead-letter-exchange", EXCHANGE_DLX)
                .withArgument("x-dead-letter-routing-key", ROUTING_KEY_PAYMENT_DLQ)
                .build();
    }

    @Bean
    public Queue webhookEventsQueue() {
        return QueueBuilder.durable(WEBHOOK_EVENTS_QUEUE)
                .withArgument("x-dead-letter-exchange", EXCHANGE_DLX)
                .withArgument("x-dead-letter-routing-key", ROUTING_KEY_WEBHOOK_DLQ)
                .build();
    }

    @Bean
    public Queue paymentEventsDlq() {
        return QueueBuilder.durable(PAYMENT_EVENTS_DLQ).build();
    }

    @Bean
    public Queue webhookEventsDlq() {
        return QueueBuilder.durable(WEBHOOK_EVENTS_DLQ).build();
    }

    @Bean
    public Binding paymentEventsBinding(Queue paymentEventsQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentEventsQueue).to(paymentExchange).with("payment.#");
    }

    @Bean
    public Binding webhookEventsBinding(Queue webhookEventsQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(webhookEventsQueue).to(paymentExchange).with("webhook.#");
    }

    @Bean
    public Binding paymentEventsDlqBinding(Queue paymentEventsDlq, TopicExchange paymentDlxExchange) {
        return BindingBuilder.bind(paymentEventsDlq).to(paymentDlxExchange).with(ROUTING_KEY_PAYMENT_DLQ);
    }

    @Bean
    public Binding webhookEventsDlqBinding(Queue webhookEventsDlq, TopicExchange paymentDlxExchange) {
        return BindingBuilder.bind(webhookEventsDlq).to(paymentDlxExchange).with(ROUTING_KEY_WEBHOOK_DLQ);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
