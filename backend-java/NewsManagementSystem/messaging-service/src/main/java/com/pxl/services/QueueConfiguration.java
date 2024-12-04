package com.pxl.services;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueueConfiguration {
    @Bean
    public Queue reviewQueue() {
        return new Queue("reviewQueue", false);
    }

    @Bean
    public MessageConverter jackson2MessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        // Add the allowed class name pattern for ReviewDTO
        converter.setClassMapper(new DefaultClassMapper());
        return converter;
    }
}

