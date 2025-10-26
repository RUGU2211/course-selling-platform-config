package com.courseselling.coursemanagement.controller;

import com.courseselling.coursemanagement.model.Review;
import com.courseselling.coursemanagement.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        return ResponseEntity.ok(service.createReview(review));
    }

    @GetMapping("/course/{courseId}")
    public List<Review> getReviewsByCourseId(@PathVariable Long courseId) {
        return service.getReviewsByCourseId(courseId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReview(@PathVariable Long id) {
        return service.getReviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review review) {
        return ResponseEntity.ok(service.updateReview(id, review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        service.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    // Rating summaries
    @GetMapping("/course/{courseId}/summary")
    public Map<String, Object> getCourseSummary(@PathVariable Long courseId) {
        return service.getCourseSummary(courseId);
    }

    @GetMapping("/summary")
    public Map<String, Object> getGlobalSummary() {
        return service.getGlobalSummary();
    }
}
