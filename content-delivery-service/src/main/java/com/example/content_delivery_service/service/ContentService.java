package com.example.content_delivery_service.service;

import com.example.content_delivery_service.entity.Content;
import com.example.content_delivery_service.repository.ContentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContentService {

    private final ContentRepository contentRepository;

    public ContentService(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    // Save new content
    public Content saveContent(Content content) {
        return contentRepository.save(content);
    }

    // Get all content
    public List<Content> getAllContent() {
        return contentRepository.findAll();
    }

    // Get content by ID
    public Optional<Content> getContentById(Long id) {
        return contentRepository.findById(id);
    }

    // Get content by courseId
    public List<Content> getContentByCourseId(Long courseId) {
        return contentRepository.findByCourseId(courseId);
    }

    // Delete content
    public void deleteContent(Long id) {
        contentRepository.deleteById(id);
    }
}
