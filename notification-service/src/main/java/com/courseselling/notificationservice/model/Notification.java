package com.courseselling.notificationservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    // Types: EMAIL, ANNOUNCEMENT, PAYMENT, CERTIFICATE
    private String type;

    private String subject;

    @Column(length = 2000)
    private String message;

    @Column(name = "`read`")
    private Boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private Long relatedEntityId;

    private String relatedEntityType;

    // Getters and Setters
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public Long getUserId() {return userId;}
    public void setUserId(Long userId) {this.userId = userId;}

    public String getType() {return type;}
    public void setType(String type) {this.type = type;}

    public String getSubject() {return subject;}
    public void setSubject(String subject) {this.subject = subject;}

    public String getMessage() {return message;}
    public void setMessage(String message) {this.message = message;}

    public Boolean getRead() {return read;}
    public void setRead(Boolean read) {this.read = read;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public Long getRelatedEntityId() {return relatedEntityId;}
    public void setRelatedEntityId(Long relatedEntityId) {this.relatedEntityId = relatedEntityId;}

    public String getRelatedEntityType() {return relatedEntityType;}
    public void setRelatedEntityType(String relatedEntityType) {this.relatedEntityType = relatedEntityType;}
}
