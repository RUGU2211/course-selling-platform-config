package com.example.enrollmentservice.repository;

import com.example.enrollmentservice.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // Find all enrollments for a specific student
    List<Enrollment> findByStudentId(Long studentId);

    // Optional: find all enrollments for a specific course
    List<Enrollment> findByCourseId(Long courseId);
}
