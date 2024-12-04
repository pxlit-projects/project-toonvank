package com.pxl.services.services;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@RabbitListener
@Service
public class QueueService {
    @RabbitListener(queues = "reviewQueue")
    public void listen(String in) {
        System.out.println("Message read from myQueue : " + in);
    }
}