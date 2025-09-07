package com.courseselling.notificationservice.service;

import com.courseselling.notificationservice.model.Notification;
import com.courseselling.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public Notification sendNotification(Notification notification) {
        return repository.save(notification);
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
}
