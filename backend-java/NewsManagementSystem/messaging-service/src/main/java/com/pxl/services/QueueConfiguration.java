package com.pxl.services;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueueConfiguration {
    @Bean
    public Queue reviewQueue() {
        return new Queue("reviewQueue", false);
    }

    @Bean
    public Jackson2JsonMessageConverter jacksonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        // Configure trusted classes
        converter.setClassMapper(new DefaultClassMapper() {{
            setTrustedPackages("com.pxl.services.domain.DTO.ReviewDTO");
        }});
        return converter;
    }
}

