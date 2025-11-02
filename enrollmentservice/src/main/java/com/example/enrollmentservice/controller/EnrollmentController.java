package com.example.enrollmentservice.controller;

import com.example.enrollmentservice.entity.Enrollment;
import com.example.enrollmentservice.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    private final EnrollmentService service;

    public EnrollmentController(EnrollmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody EnrollmentRequest req) {
        try {
            if (req.getStudentId() == null || req.getCourseId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Student ID and Course ID are required");
                return ResponseEntity.badRequest().body(error);
            }
            Enrollment saved = service.enroll(req.getStudentId(), req.getCourseId());
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Enrollment failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
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
        Enrollment enrollment = service.updateCompletion(id, req.isCompleted());
        return ResponseEntity.ok(enrollment);
    }

    @PutMapping("/{id}/stage1")
    public ResponseEntity<Enrollment> updateStage1(@PathVariable Long id, @RequestBody StageRequest req) {
        try {
            Enrollment enrollment = service.updateStage1(id, req.isCompleted());
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/stage2")
    public ResponseEntity<Enrollment> updateStage2(@PathVariable Long id, @RequestBody StageRequest req) {
        try {
            Enrollment enrollment = service.updateStage2(id, req.isCompleted());
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/current-stage")
    public ResponseEntity<Enrollment> updateCurrentStage(@PathVariable Long id, @RequestBody CurrentStageRequest req) {
        try {
            Enrollment enrollment = service.updateCurrentStage(id, req.getStage());
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete enrollment: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<Map<String, Object>> getStudentStats(@PathVariable Long studentId) {
        try {
            Map<String, Object> stats = service.getStudentStats(studentId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        try {
            Map<String, Object> stats = service.getGlobalStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
