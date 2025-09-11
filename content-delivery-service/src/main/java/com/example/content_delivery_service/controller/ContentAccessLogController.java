package com.example.content_delivery_service.controller;

import com.example.content_delivery_service.entity.ContentAccessLog;
import com.example.content_delivery_service.service.ContentAccessLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ContentAccessLogController {

    private final ContentAccessLogService logService;

    public ContentAccessLogController(ContentAccessLogService logService) {
        this.logService = logService;
    }

    // ➕ Save new log (stream or download action)
    @PostMapping
    public ResponseEntity<ContentAccessLog> addLog(@RequestBody ContentAccessLog log) {
        return ResponseEntity.ok(logService.saveLog(log));
    }

    // 📄 Get all logs
    @GetMapping
    public ResponseEntity<List<ContentAccessLog>> getAllLogs() {
        return ResponseEntity.ok(logService.getAllLogs());
    }

    // 🔍 Get logs by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContentAccessLog>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(logService.getLogsByUser(userId));
    }
}
