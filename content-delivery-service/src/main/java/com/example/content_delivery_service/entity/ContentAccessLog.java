package com.example.content_delivery_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.proxy.HibernateProxy;

@Entity
@Table(name = "content_access_logs")
public class ContentAccessLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;
    private Long userId;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "content_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Content content;
    @Enumerated(EnumType.STRING)
    private ContentActionType action; // enum STREAM, DOWNLOAD
    private LocalDateTime accessTime;

    @PrePersist
    public void prePersist() {
        if (accessTime == null) accessTime = LocalDateTime.now();
    }

    // Getters and setters
    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Content getContent() {
        if (content instanceof HibernateProxy proxy) {
            return (Content) proxy.getHibernateLazyInitializer().getImplementation();
        }
        return content;
    }
    public void setContent(Content content) { this.content = content; }

    public ContentActionType getAction() { return action; }
    public void setAction(ContentActionType action) { this.action = action; }

    public LocalDateTime getAccessTime() { return accessTime; }
    public void setAccessTime(LocalDateTime accessTime) { this.accessTime = accessTime; }
}
