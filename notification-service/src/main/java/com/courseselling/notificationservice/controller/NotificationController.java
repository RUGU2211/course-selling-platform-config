package com.courseselling.notificationservice.controller;

import com.courseselling.notificationservice.model.Notification;
import com.courseselling.notificationservice.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    // Send a notification
    @PostMapping("/send")
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        Notification saved = service.sendNotification(notification);
        return ResponseEntity.ok(saved);
    }

    // Get notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsForUser(@PathVariable Long userId) {
        List<Notification> notifications = service.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        return service.markAsRead(id)
                .map(n -> ResponseEntity.ok().<Void>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get unread notification count for a user
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@RequestParam(defaultValue = "1") Long userId) {
        Long count = service.getUnreadCount(userId);
        return ResponseEntity.ok(new UnreadCountResponse(count));
    }

    // Response DTO for unread count
    public static class UnreadCountResponse {
        private Long count;

        public UnreadCountResponse(Long count) {
            this.count = count;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }
}
