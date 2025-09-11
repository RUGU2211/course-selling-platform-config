package com.example.content_delivery_service.service;

import com.example.content_delivery_service.entity.ContentAccessLog;
import com.example.content_delivery_service.repository.ContentAccessLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentAccessLogService {

    private final ContentAccessLogRepository logRepository;

    public ContentAccessLogService(ContentAccessLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    // Save log
    public ContentAccessLog saveLog(ContentAccessLog log) {
        return logRepository.save(log);
    }

    // Get logs by user
    public List<ContentAccessLog> getLogsByUser(Long userId) {
        return logRepository.findByUserId(userId);
    }

    // Get all logs
    public List<ContentAccessLog> getAllLogs() {
        return logRepository.findAll();
    }
}

