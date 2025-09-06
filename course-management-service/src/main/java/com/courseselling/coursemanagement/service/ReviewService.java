package com.courseselling.coursemanagement.service;
import com.courseselling.coursemanagement.model.Review;
import com.courseselling.coursemanagement.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
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
}
