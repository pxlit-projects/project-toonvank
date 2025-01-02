package com.pxl.services.client;

import com.pxl.services.domain.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {
    @PostMapping("/api/notification")
    void sendNotification(@RequestBody NotificationRequest notificationRequest);
}