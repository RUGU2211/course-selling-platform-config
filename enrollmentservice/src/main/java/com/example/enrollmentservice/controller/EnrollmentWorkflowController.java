package com.example.enrollmentservice.controller;

import com.example.enrollmentservice.client.CourseServiceClient;
import com.example.enrollmentservice.client.PaymentServiceClient;
import com.example.enrollmentservice.client.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/enrollment-service/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentWorkflowController {

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private CourseServiceClient courseServiceClient;

    @Autowired
    private PaymentServiceClient paymentServiceClient;

    @PostMapping("/workflow/enroll")
    public ResponseEntity<Map<String, Object>> enrollWithValidation(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Step 1: Validate student exists
            Object student = userServiceClient.getUserProfile(studentId);
            response.put("student", student);
            
            // Step 2: Validate course exists
            Object course = courseServiceClient.getCourseById(courseId);
            response.put("course", course);
            
            // Step 3: Check if student has valid payment
            Object payments = paymentServiceClient.getUserPayments(studentId);
            response.put("payments", payments);
            
            // Step 4: Create enrollment (this would be the actual enrollment logic)
            Map<String, Object> enrollment = new HashMap<>();
            enrollment.put("studentId", studentId);
            enrollment.put("courseId", courseId);
            enrollment.put("status", "ENROLLED");
            enrollment.put("enrollmentDate", java.time.LocalDateTime.now());
            
            response.put("enrollment", enrollment);
            response.put("status", "success");
            response.put("message", "Enrollment workflow completed successfully");
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Enrollment workflow failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/workflow/student/{studentId}/summary")
    public ResponseEntity<Map<String, Object>> getStudentEnrollmentSummary(@PathVariable Long studentId) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Get student profile
            Object student = userServiceClient.getUserProfile(studentId);
            summary.put("student", student);
            
            // Get student's payments
            Object payments = paymentServiceClient.getUserPayments(studentId);
            summary.put("payments", payments);
            
            summary.put("status", "success");
            summary.put("message", "Student enrollment summary retrieved successfully");
            
        } catch (Exception e) {
            summary.put("status", "error");
            summary.put("message", "Failed to retrieve student summary: " + e.getMessage());
        }
        
        return ResponseEntity.ok(summary);
    }
}
