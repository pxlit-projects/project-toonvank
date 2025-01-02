package com.pxl.services.controller;

import com.pxl.services.domain.Notification;
import com.pxl.services.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void sendEmail(@RequestBody Notification notification) {
        notificationService.sendEmail(notification);
    }
}