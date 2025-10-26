package com.courseselling.coursemanagement.repository;

import com.courseselling.coursemanagement.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourseId(Long courseId);

    long countByCourseId(Long courseId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.courseId = :courseId")
    Double averageByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT AVG(r.rating) FROM Review r")
    Double averageAll();
}
