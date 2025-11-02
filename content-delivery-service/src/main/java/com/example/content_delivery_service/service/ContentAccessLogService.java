package com.example.content_delivery_service.service;

import com.example.content_delivery_service.entity.ContentAccessLog;
import com.example.content_delivery_service.entity.Content;
import com.example.content_delivery_service.dto.ContentAccessLogDto;
import com.example.content_delivery_service.dto.ContentAccessLogRequest;
import com.example.content_delivery_service.repository.ContentAccessLogRepository;
import com.example.content_delivery_service.repository.ContentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContentAccessLogService {

    private final ContentAccessLogRepository logRepository;
    private final ContentRepository contentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ContentAccessLogService(ContentAccessLogRepository logRepository, ContentRepository contentRepository, SimpMessagingTemplate messagingTemplate) {
        this.logRepository = logRepository;
        this.contentRepository = contentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public ContentAccessLog saveLog(ContentAccessLog log) {
        ContentAccessLog saved = logRepository.save(log);
        try {
            ContentAccessLogDto dto = ContentAccessLogDto.fromEntity(saved);
            messagingTemplate.convertAndSend("/topic/content-logs", dto);
        } catch (Exception ignored) {
            // Avoid failing the save if broadcasting encounters any issues
        }
        return saved;
    }

    public ContentAccessLog saveLogFromRequest(ContentAccessLogRequest request) {
        // Fetch the Content entity by ID
        Optional<Content> contentOpt = contentRepository.findById(request.getContentId());
        if (contentOpt.isEmpty()) {
            throw new RuntimeException("Content not found with id: " + request.getContentId());
        }

        // Create the log entity
        ContentAccessLog log = new ContentAccessLog();
        log.setUserId(request.getUserId());
        log.setContent(contentOpt.get());
        log.setAction(com.example.content_delivery_service.entity.ContentActionType.valueOf(request.getAction()));

        // Save and broadcast
        return saveLog(log);
    }

    public List<ContentAccessLog> getLogsByUser(Long userId) {
        return logRepository.findByUserId(userId);
    }

    public List<ContentAccessLog> getAllLogs() {
        return logRepository.findAll();
    }
}

