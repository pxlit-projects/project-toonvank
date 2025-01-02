package com.pxl.services.services;

import com.pxl.services.domain.Notification;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailUsername;

    public void sendEmail(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(notification.getTo());
            message.setText(notification.getText());
            message.setSubject(notification.getSubject());

            mailSender.send(message);
            logger.info("E-mail has been sent to: {}", notification.getTo());
        } catch (Exception e) {
            logger.error("Error in sending mail: {}", e.getMessage());
            throw new RuntimeException("E-mail can't be sent", e);
        }
    }
}