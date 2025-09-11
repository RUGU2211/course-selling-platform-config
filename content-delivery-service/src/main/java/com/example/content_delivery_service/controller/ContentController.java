package com.example.content_delivery_service.controller;

import com.example.content_delivery_service.entity.Content;
import com.example.content_delivery_service.service.ContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
public class    ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    // ➕ Add new content
    @PostMapping
    public ResponseEntity<Content> addContent(@RequestBody Content content) {
        return ResponseEntity.ok(contentService.saveContent(content));
    }

    // 📄 Get all content
    @GetMapping
    public ResponseEntity<List<Content>> getAllContent() {
        return ResponseEntity.ok(contentService.getAllContent());
    }

    // 🔍 Get content by ID
    @GetMapping("/{id}")
    public ResponseEntity<Content> getContentById(@PathVariable Long id) {
        return contentService.getContentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 📚 Get content by course ID
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Content>> getContentByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(contentService.getContentByCourseId(courseId));
    }

    // ❌ Delete content
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}

