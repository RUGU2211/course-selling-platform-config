package com.example.content_delivery_service.entity;

import com.netflix.appinfo.InstanceInfo;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_access_logs")
public class ContentAccessLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;
    private Long userId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private Content content;
    @Enumerated(EnumType.STRING)
    private InstanceInfo.ActionType action; // enum STREAM, DOWNLOAD
    private LocalDateTime accessTime;

    @PrePersist
    public void prePersist() {
        if (accessTime == null) accessTime = LocalDateTime.now();
    }
    // Getters and setters
}
