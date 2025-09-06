package com.courseselling.coursemanagement.controller;

import com.courseselling.coursemanagement.model.CourseContent;
import com.courseselling.coursemanagement.service.CourseContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-contents")
public class CourseContentController {

    private final CourseContentService service;

    public CourseContentController(CourseContentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CourseContent> createContent(@RequestBody CourseContent content) {
        return ResponseEntity.ok(service.createContent(content));
    }

    @GetMapping("/course/{courseId}")
    public List<CourseContent> getContentsByCourse(@PathVariable Long courseId) {
        return service.getContentsByCourseId(courseId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseContent> getContent(@PathVariable Long id) {
        return service.getContentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseContent> updateContent(@PathVariable Long id, @RequestBody CourseContent content) {
        return ResponseEntity.ok(service.updateContent(id, content));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContent(@PathVariable Long id) {
        service.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}
