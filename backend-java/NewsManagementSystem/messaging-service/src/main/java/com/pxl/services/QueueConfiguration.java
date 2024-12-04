package com.pxl.services;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueueConfiguration {
    @Bean
    public Queue getApprovalQueue() {
        return new Queue("getApproval", false);
    }

    @Bean
    public Queue setReviewQueue() {
        return new Queue("setReview", false);
    }

}

