package com.example.content_delivery_service.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import java.util.Map;

public class ContentAccessLogRequest {
    private Long userId;
    private Long contentId;
    private String action;

    // Default constructor
    public ContentAccessLogRequest() {
    }

    // Constructor with nested content object support (for backward compatibility)
    public ContentAccessLogRequest(Long userId, ContentRef content, String action) {
        this.userId = userId;
        this.contentId = content != null ? content.contentId : null;
        this.action = action;
    }

    // Simple constructor
    public ContentAccessLogRequest(Long userId, Long contentId, String action) {
        this.userId = userId;
        this.contentId = contentId;
        this.action = action;
    }

    // Getters and setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    // Handle nested content object from JSON
    @JsonAnySetter
    public void handleContentField(String key, Object value) {
        if ("content".equals(key) && value instanceof Map) {
            Map<String, Object> contentMap = (Map<String, Object>) value;
            if (contentMap.containsKey("contentId")) {
                this.contentId = Long.valueOf(contentMap.get("contentId").toString());
            }
        }
    }

    // Nested class for backward compatibility
    public static class ContentRef {
        public Long contentId;

        public Long getContentId() {
            return contentId;
        }

        public void setContentId(Long contentId) {
            this.contentId = contentId;
        }
    }
}

