package com.courseselling.coursemanagement.service;
import com.courseselling.coursemanagement.model.Review;
import com.courseselling.coursemanagement.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository repository;

    public ReviewService(ReviewRepository repository) {
        this.repository = repository;
    }

    public Review createReview(Review review) {
        return repository.save(review);
    }

    public List<Review> getReviewsByCourseId(Long courseId) {
        return repository.findByCourseId(courseId);
    }

    public Optional<Review> getReviewById(Long id) {
        return repository.findById(id);
    }

    public Review updateReview(Long id, Review reviewDetails) {
        Review review = repository.findById(id).orElseThrow();
        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        return repository.save(review);
    }

    public void deleteReview(Long id) {
        repository.deleteById(id);
    }

    public Map<String, Object> getCourseSummary(Long courseId) {
        Double avg = repository.averageByCourseId(courseId);
        long count = repository.countByCourseId(courseId);
        Map<String, Object> result = new HashMap<>();
        result.put("courseId", courseId);
        result.put("average", avg != null ? avg : 0.0);
        result.put("count", count);
        return result;
    }

    public Map<String, Object> getGlobalSummary() {
        Double avg = repository.averageAll();
        long count = repository.count();
        Map<String, Object> result = new HashMap<>();
        result.put("average", avg != null ? avg : 0.0);
        result.put("count", count);
        return result;
    }
}
