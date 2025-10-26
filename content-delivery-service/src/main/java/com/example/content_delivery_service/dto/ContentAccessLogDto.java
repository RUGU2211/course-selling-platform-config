package com.example.content_delivery_service.dto;

import com.example.content_delivery_service.entity.ContentAccessLog;

public class ContentAccessLogDto {
    public Long logId;
    public Long userId;
    public Long contentId;
    public String action;
    public java.time.LocalDateTime accessTime;

    public static ContentAccessLogDto fromEntity(ContentAccessLog e) {
        ContentAccessLogDto d = new ContentAccessLogDto();
        d.logId = e.getLogId();
        d.userId = e.getUserId();
        d.contentId = e.getContent() != null ? e.getContent().getContentId() : null;
        d.action = e.getAction() != null ? e.getAction().name() : null;
        d.accessTime = e.getAccessTime();
        return d;
    }
}