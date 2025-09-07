package com.example.enrollmentservice.controller;



import com.example.enrollmentservice.entity.Enrollment;
import com.example.enrollmentservice.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// DTO class to map JSON request body for enrolling


@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // 1. Enroll in a course - accepts JSON body
    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestBody EnrollmentRequest request) {
        Enrollment enrollment = enrollmentService.enroll(request.getStudentId(), request.getCourseId());
        return ResponseEntity.ok(enrollment);
    }

    // 2. Get all courses for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    // 3. Update progress
    @PutMapping("/{id}/progress")
    public ResponseEntity<Enrollment> updateProgress(
            @PathVariable Long id,
            @RequestParam int progress) {
        Optional<Enrollment> updated = enrollmentService.updateProgress(id, progress);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // 4. Mark complete
    @PostMapping("/{id}/complete")
    public ResponseEntity<Enrollment> completeCourse(
            @PathVariable Long id,
            @RequestParam String certificateUrl) {
        Optional<Enrollment> completed = enrollmentService.completeCourse(id, certificateUrl);
        return completed.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}

