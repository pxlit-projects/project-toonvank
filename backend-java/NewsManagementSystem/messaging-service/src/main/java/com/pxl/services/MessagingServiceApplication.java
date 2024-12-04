package com.pxl.services;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class MessagingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(com.pxl.services.MessagingServiceApplication.class, args);
    }
}