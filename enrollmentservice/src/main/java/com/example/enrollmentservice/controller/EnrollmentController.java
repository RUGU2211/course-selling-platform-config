package com.example.enrollmentservice.controller;

import com.example.enrollmentservice.entity.Enrollment;
import com.example.enrollmentservice.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService service;

    public EnrollmentController(EnrollmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestBody EnrollmentRequest req) {
        Enrollment saved = service.enroll(req.getStudentId(), req.getCourseId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(service.getByStudentId(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.getByCourseId(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Enrollment> updateProgress(@PathVariable Long id, @RequestBody ProgressRequest req) {
        Enrollment enrollment = service.updateProgress(id, req.getProgress());
        return ResponseEntity.ok(enrollment);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Enrollment> updateCompletion(@PathVariable Long id, @RequestBody CompletionRequest req) {
        Enrollment enrollment = service.updateCompletion(id, req.isCompleted(), req.getCertificateUrl());
        return ResponseEntity.ok(enrollment);
    }
}
