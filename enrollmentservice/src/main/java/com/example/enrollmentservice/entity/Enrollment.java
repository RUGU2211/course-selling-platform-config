package com.example.enrollmentservice.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long courseId;

    private Integer progress;       // 0 - 100
    private Boolean completed;
    
    // Stage tracking for two-stage completion
    private Boolean stage1Completed;  // Stage 1 completion status
    private Boolean stage2Completed;  // Stage 2 completion status
    private Integer currentStage;     // Current stage: 0 (not started), 1 (stage 1), 2 (stage 2), 3 (completed)

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime enrolledAt;

    public Enrollment() {
    }

    public Enrollment(Long id, Long studentId, Long courseId, Integer progress, Boolean completed, Boolean stage1Completed, Boolean stage2Completed, Integer currentStage, LocalDateTime enrolledAt) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.progress = progress;
        this.completed = completed;
        this.stage1Completed = stage1Completed;
        this.stage2Completed = stage2Completed;
        this.currentStage = currentStage;
        this.enrolledAt = enrolledAt;
    }

    @PrePersist
    public void prePersist() {
        if (enrolledAt == null) {
            enrolledAt = LocalDateTime.now();
        }
        if (progress == null) {
            progress = 0;
        }
        if (completed == null) {
            completed = false;
        }
        if (stage1Completed == null) {
            stage1Completed = false;
        }
        if (stage2Completed == null) {
            stage2Completed = false;
        }
        if (currentStage == null) {
            currentStage = 0; // Not started
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long studentId;
        private Long courseId;
        private Integer progress;
        private Boolean completed;
        private Boolean stage1Completed;
        private Boolean stage2Completed;
        private Integer currentStage;
        private LocalDateTime enrolledAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder studentId(Long studentId) {
            this.studentId = studentId;
            return this;
        }

        public Builder courseId(Long courseId) {
            this.courseId = courseId;
            return this;
        }

        public Builder progress(Integer progress) {
            this.progress = progress;
            return this;
        }

        public Builder completed(Boolean completed) {
            this.completed = completed;
            return this;
        }

        public Builder stage1Completed(Boolean stage1Completed) {
            this.stage1Completed = stage1Completed;
            return this;
        }

        public Builder stage2Completed(Boolean stage2Completed) {
            this.stage2Completed = stage2Completed;
            return this;
        }

        public Builder currentStage(Integer currentStage) {
            this.currentStage = currentStage;
            return this;
        }

        public Builder enrolledAt(LocalDateTime enrolledAt) {
            this.enrolledAt = enrolledAt;
            return this;
        }

        public Enrollment build() {
            return new Enrollment(id, studentId, courseId, progress, completed, stage1Completed, stage2Completed, currentStage, enrolledAt);
        }
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public Boolean getStage1Completed() {
        return stage1Completed;
    }

    public void setStage1Completed(Boolean stage1Completed) {
        this.stage1Completed = stage1Completed;
    }

    public Boolean getStage2Completed() {
        return stage2Completed;
    }

    public void setStage2Completed(Boolean stage2Completed) {
        this.stage2Completed = stage2Completed;
    }

    public Integer getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(Integer currentStage) {
        this.currentStage = currentStage;
    }
}
