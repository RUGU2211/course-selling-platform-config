package com.example.content_delivery_service.controller;

import com.example.content_delivery_service.entity.ContentAccessLog;
import com.example.content_delivery_service.dto.ContentAccessLogDto;
import com.example.content_delivery_service.service.ContentAccessLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/logs")
public class ContentAccessLogController {

    private final ContentAccessLogService logService;

    public ContentAccessLogController(ContentAccessLogService logService) {
        this.logService = logService;
    }

    @PostMapping
    public ResponseEntity<ContentAccessLog> addLog(@RequestBody ContentAccessLog log) {
        return ResponseEntity.ok(logService.saveLog(log));
    }

    @GetMapping
    public ResponseEntity<List<ContentAccessLogDto>> getAllLogs() {
        List<ContentAccessLogDto> dtos = logService.getAllLogs().stream()
                .map(ContentAccessLogDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContentAccessLogDto>> getLogsByUser(@PathVariable Long userId) {
        List<ContentAccessLogDto> dtos = logService.getLogsByUser(userId).stream()
                .map(ContentAccessLogDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
