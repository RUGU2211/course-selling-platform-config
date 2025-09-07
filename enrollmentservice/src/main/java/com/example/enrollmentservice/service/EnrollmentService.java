package com.example.enrollmentservice.service;

import com.example.enrollmentservice.entity.Enrollment;
import com.example.enrollmentservice.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    // Enroll in a course
    public Enrollment enroll(Long studentId, Long courseId) {
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .progress(0)
                .completed(false)
                .enrolledAt(LocalDateTime.now())
                .build();
        return enrollmentRepository.save(enrollment);
    }

    // Get all courses for a student
    public List<Enrollment> getStudentEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    // Update progress
    public Optional<Enrollment> updateProgress(Long enrollmentId, int progress) {
        return enrollmentRepository.findById(enrollmentId).map(enrollment -> {
            enrollment.setProgress(progress);
            if (progress >= 100) {
                enrollment.setCompleted(true);
            }
            return enrollmentRepository.save(enrollment);
        });
    }

    // Mark complete and generate certificate
    public Optional<Enrollment> completeCourse(Long enrollmentId, String certificateUrl) {
        return enrollmentRepository.findById(enrollmentId).map(enrollment -> {
            enrollment.setCompleted(true);
            enrollment.setProgress(100);
            enrollment.setCertificateUrl(certificateUrl);
            return enrollmentRepository.save(enrollment);
        });
    }
}