package com.example.enrollmentservice.service;

import com.example.enrollmentservice.entity.Enrollment;
import com.example.enrollmentservice.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository repository;

    public EnrollmentService(EnrollmentRepository repository) {
        this.repository = repository;
    }

    // Enroll a student to a course
    public Enrollment enroll(Long studentId, Long courseId) {
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .progress(0)
                .completed(false)
                .certificateUrl(null)
                .build();
        return repository.save(enrollment);
    }

    public List<Enrollment> getByStudentId(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    public List<Enrollment> getByCourseId(Long courseId) {
        return repository.findByCourseId(courseId);
    }

    public Optional<Enrollment> getById(Long id) {
        return repository.findById(id);
    }

    public Enrollment updateProgress(Long id, int progress) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            Enrollment enrollment = opt.get();
            enrollment.setProgress(progress);
            return repository.save(enrollment);
        }
        throw new RuntimeException("Enrollment not found");
    }

    public Enrollment updateCompletion(Long id, boolean completed, String certificateUrl) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            Enrollment enrollment = opt.get();
            enrollment.setCompleted(completed);
            enrollment.setCertificateUrl(certificateUrl);
            return repository.save(enrollment);
        }
        throw new RuntimeException("Enrollment not found");
    }
}
