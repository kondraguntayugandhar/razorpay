package com.thirdprd.payment.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "payment.exchange";
    public static final String PAYMENT_EVENTS_QUEUE = "payment.events";
    public static final String WEBHOOK_EVENTS_QUEUE = "webhook.events";

    public static final String ROUTING_KEY_PAYMENT_CREATED = "payment.created";
    public static final String ROUTING_KEY_PAYMENT_SUCCEEDED = "payment.succeeded";
    public static final String ROUTING_KEY_PAYMENT_FAILED = "payment.failed";
    public static final String ROUTING_KEY_WEBHOOK_RECEIVED = "webhook.received";

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue paymentEventsQueue() {
        return QueueBuilder.durable(PAYMENT_EVENTS_QUEUE).build();
    }

    @Bean
    public Queue webhookEventsQueue() {
        return QueueBuilder.durable(WEBHOOK_EVENTS_QUEUE).build();
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
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
