package com.example.enrollmentservice.service;

import com.example.enrollmentservice.entity.Enrollment;
import com.example.enrollmentservice.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository repository;

    public EnrollmentService(EnrollmentRepository repository) {
        this.repository = repository;
    }

    // Enroll a student to a course
    public Enrollment enroll(Long studentId, Long courseId) {
        // Check if already enrolled
        List<Enrollment> existing = repository.findByStudentId(studentId);
        boolean alreadyEnrolled = existing.stream()
                .anyMatch(e -> e.getCourseId().equals(courseId));
        
        if (alreadyEnrolled) {
            throw new RuntimeException("Student is already enrolled in this course");
        }
        
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .progress(0)
                .completed(false)
                .stage1Completed(false)
                .stage2Completed(false)
                .currentStage(0)
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

    public Enrollment updateCompletion(Long id, boolean completed) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            Enrollment enrollment = opt.get();
            enrollment.setCompleted(completed);
            if (completed) {
                enrollment.setCurrentStage(3); // Course completed
            }
            return repository.save(enrollment);
        }
        throw new RuntimeException("Enrollment not found");
    }

    // Update stage 1 completion
    public Enrollment updateStage1(Long id, boolean completed) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            Enrollment enrollment = opt.get();
            enrollment.setStage1Completed(completed);
            if (completed) {
                enrollment.setCurrentStage(1); // Stage 1 completed, move to stage 2
                // Update progress to 50% when stage 1 is completed
                enrollment.setProgress(50);
            }
            return repository.save(enrollment);
        }
        throw new RuntimeException("Enrollment not found");
    }

    // Update stage 2 completion
    public Enrollment updateStage2(Long id, boolean completed) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            Enrollment enrollment = opt.get();
            enrollment.setStage2Completed(completed);
            if (completed) {
                enrollment.setCurrentStage(2); // Stage 2 completed
                enrollment.setProgress(100);
                enrollment.setCompleted(true); // Course completed when both stages done
                enrollment.setCurrentStage(3); // Course fully completed
            }
            return repository.save(enrollment);
        }
        throw new RuntimeException("Enrollment not found");
    }

    // Update current stage directly
    public Enrollment updateCurrentStage(Long id, int stage) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            Enrollment enrollment = opt.get();
            enrollment.setCurrentStage(stage);
            
            // Auto-update stage completion flags based on current stage
            if (stage >= 1) {
                enrollment.setStage1Completed(true);
            }
            if (stage >= 2) {
                enrollment.setStage2Completed(true);
            }
            if (stage >= 3) {
                enrollment.setCompleted(true);
                enrollment.setProgress(100);
            }
            
            return repository.save(enrollment);
        }
        throw new RuntimeException("Enrollment not found");
    }

    public void deleteById(Long id) {
        Optional<Enrollment> opt = repository.findById(id);
        if (opt.isPresent()) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("Enrollment not found");
        }
    }

    public Map<String, Object> getStudentStats(Long studentId) {
        List<Enrollment> enrollments = repository.findByStudentId(studentId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEnrollments", enrollments.size());
        stats.put("completedCourses", enrollments.stream()
                .mapToInt(e -> Boolean.TRUE.equals(e.getCompleted()) ? 1 : 0)
                .sum());
        
        if (!enrollments.isEmpty()) {
            double avgProgress = enrollments.stream()
                    .mapToInt(e -> e.getProgress() != null ? e.getProgress() : 0)
                    .average()
                    .orElse(0.0);
            stats.put("averageProgress", avgProgress);
            
            // Get recent 5 enrollments
            List<Map<String, Object>> recent = enrollments.stream()
                    .sorted((a, b) -> {
                        if (a.getEnrolledAt() == null && b.getEnrolledAt() == null) return 0;
                        if (a.getEnrolledAt() == null) return 1;
                        if (b.getEnrolledAt() == null) return -1;
                        return b.getEnrolledAt().compareTo(a.getEnrolledAt());
                    })
                    .limit(5)
                    .map(e -> {
                        Map<String, Object> enrollmentMap = new HashMap<>();
                        enrollmentMap.put("id", e.getId());
                        enrollmentMap.put("studentId", e.getStudentId());
                        enrollmentMap.put("courseId", e.getCourseId());
                        enrollmentMap.put("progress", e.getProgress());
                        enrollmentMap.put("completed", e.getCompleted());
                        enrollmentMap.put("stage1Completed", e.getStage1Completed());
                        enrollmentMap.put("stage2Completed", e.getStage2Completed());
                        enrollmentMap.put("currentStage", e.getCurrentStage());
                        enrollmentMap.put("enrolledAt", e.getEnrolledAt());
                        return enrollmentMap;
                    })
                    .collect(Collectors.toList());
            stats.put("recentEnrollments", recent);
        } else {
            stats.put("averageProgress", 0.0);
            stats.put("recentEnrollments", new ArrayList<>());
        }
        
        return stats;
    }

    public Map<String, Object> getGlobalStats() {
        List<Enrollment> allEnrollments = repository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEnrollments", allEnrollments.size());
        stats.put("completedCourses", allEnrollments.stream()
                .mapToInt(e -> Boolean.TRUE.equals(e.getCompleted()) ? 1 : 0)
                .sum());
        
        if (!allEnrollments.isEmpty()) {
            double avgProgress = allEnrollments.stream()
                    .mapToInt(e -> e.getProgress() != null ? e.getProgress() : 0)
                    .average()
                    .orElse(0.0);
            stats.put("averageProgress", avgProgress);
            
            // Get recent 10 enrollments
            List<Map<String, Object>> recent = allEnrollments.stream()
                    .sorted((a, b) -> {
                        if (a.getEnrolledAt() == null && b.getEnrolledAt() == null) return 0;
                        if (a.getEnrolledAt() == null) return 1;
                        if (b.getEnrolledAt() == null) return -1;
                        return b.getEnrolledAt().compareTo(a.getEnrolledAt());
                    })
                    .limit(10)
                    .map(e -> {
                        Map<String, Object> enrollmentMap = new HashMap<>();
                        enrollmentMap.put("id", e.getId());
                        enrollmentMap.put("studentId", e.getStudentId());
                        enrollmentMap.put("courseId", e.getCourseId());
                        enrollmentMap.put("progress", e.getProgress());
                        enrollmentMap.put("completed", e.getCompleted());
                        enrollmentMap.put("stage1Completed", e.getStage1Completed());
                        enrollmentMap.put("stage2Completed", e.getStage2Completed());
                        enrollmentMap.put("currentStage", e.getCurrentStage());
                        enrollmentMap.put("enrolledAt", e.getEnrolledAt());
                        return enrollmentMap;
                    })
                    .collect(Collectors.toList());
            stats.put("recentEnrollments", recent);
        } else {
            stats.put("averageProgress", 0.0);
            stats.put("recentEnrollments", new ArrayList<>());
        }
        
        return stats;
    }
}
