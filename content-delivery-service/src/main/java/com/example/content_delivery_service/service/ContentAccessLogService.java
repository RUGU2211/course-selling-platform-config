package com.example.content_delivery_service.service;

import com.example.content_delivery_service.entity.ContentAccessLog;
import com.example.content_delivery_service.dto.ContentAccessLogDto;
import com.example.content_delivery_service.repository.ContentAccessLogRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentAccessLogService {

    private final ContentAccessLogRepository logRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ContentAccessLogService(ContentAccessLogRepository logRepository, SimpMessagingTemplate messagingTemplate) {
        this.logRepository = logRepository;
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

    public List<ContentAccessLog> getLogsByUser(Long userId) {
        return logRepository.findByUserId(userId);
    }

    public List<ContentAccessLog> getAllLogs() {
        return logRepository.findAll();
    }
}

