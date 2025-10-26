package com.courseselling.notificationservice.service;

import com.courseselling.notificationservice.model.Notification;
import com.courseselling.notificationservice.repository.NotificationRepository;
import com.courseselling.notificationservice.client.UserClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final EmailService emailService;
    private final UserClient userClient;

    public NotificationService(NotificationRepository repository, EmailService emailService, UserClient userClient) {
        this.repository = repository;
        this.emailService = emailService;
        this.userClient = userClient;
    }

    public Notification sendNotification(Notification notification) {
        Notification saved = repository.save(notification);
        try {
            if (saved.getUserId() != null) {
                Object userObj = userClient.getUserById(saved.getUserId());
                if (userObj instanceof Map<?, ?> userMap) {
                    Object emailObj = userMap.get("email");
                    if (emailObj != null) {
                        String to = String.valueOf(emailObj);
                        String subject = saved.getSubject() != null ? saved.getSubject() : "Notification";
                        String message = saved.getMessage() != null ? saved.getMessage() : "You have a new notification.";
                        emailService.sendEmail(to, subject, message);
                    }
                }
            }
        } catch (Exception e) {
            // swallow email errors to avoid breaking core flow
        }
        return saved;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return repository.findByUserId(userId);
    }

    public Optional<Notification> markAsRead(Long notificationId) {
        Optional<Notification> notification = repository.findById(notificationId);
        notification.ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
        return notification;
    }

    public Long getUnreadCount(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }
}
