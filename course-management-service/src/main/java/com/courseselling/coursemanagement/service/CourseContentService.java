package com.courseselling.coursemanagement.service;

import com.courseselling.coursemanagement.model.CourseContent;
import com.courseselling.coursemanagement.repository.CourseContentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseContentService {

    private final CourseContentRepository repository;

    public CourseContentService(CourseContentRepository repository) {
        this.repository = repository;
    }

    public CourseContent createContent(CourseContent content) {
        return repository.save(content);
    }

    public List<CourseContent> getContentsByCourseId(Long courseId) {
        return repository.findByCourseId(courseId);
    }

    public Optional<CourseContent> getContentById(Long id) {
        return repository.findById(id);
    }

    public CourseContent updateContent(Long id, CourseContent contentDetails) {
        CourseContent content = repository.findById(id).orElseThrow();
        content.setTitle(contentDetails.getTitle());
        content.setVideoUrl(contentDetails.getVideoUrl());
        content.setDuration(contentDetails.getDuration());
        content.setCourseId(contentDetails.getCourseId());
        return repository.save(content);
    }

    public void deleteContent(Long id) {
        repository.deleteById(id);
    }
}
