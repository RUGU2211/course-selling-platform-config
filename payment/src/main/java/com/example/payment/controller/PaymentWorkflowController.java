package com.example.payment.controller;

import com.example.payment.client.CourseServiceClient;
import com.example.payment.client.EnrollmentServiceClient;
import com.example.payment.client.UserServiceClient;
import com.example.payment.client.NotificationServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment-service/api/payments")
@CrossOrigin(origins = "*")
public class PaymentWorkflowController {

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private CourseServiceClient courseServiceClient;

    @Autowired
    private EnrollmentServiceClient enrollmentServiceClient;

    @Autowired
    private NotificationServiceClient notificationServiceClient;

    @PostMapping("/workflow/process")
    public ResponseEntity<Map<String, Object>> processPaymentWithValidation(
            @RequestParam Long userId,
            @RequestParam Long courseId,
            @RequestParam Double amount) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Step 1: Validate user exists
            Object user = userServiceClient.getUserProfile(userId);
            response.put("user", user);
            
            // Step 2: Validate course exists and get course details
            Object course = courseServiceClient.getCourseById(courseId);
            response.put("course", course);
            
            // Step 3: Process payment (simulated)
            Map<String, Object> payment = new HashMap<>();
            payment.put("userId", userId);
            payment.put("courseId", courseId);
            payment.put("amount", amount);
            payment.put("status", "COMPLETED");
            payment.put("transactionId", "TXN_" + System.currentTimeMillis());
            payment.put("paymentDate", java.time.LocalDateTime.now());
            
            response.put("payment", payment);
            
            // Notify payment success
            try {
                Map<String, Object> notification = new HashMap<>();
                notification.put("userId", userId);
                notification.put("type", "PAYMENT");
                notification.put("subject", "Payment successful");
                notification.put("message", "Your payment for course ID " + courseId + " was successful.");
                notification.put("relatedEntityId", courseId);
                notification.put("relatedEntityType", "COURSE");
                notificationServiceClient.sendNotification(notification);
            } catch (Exception ignored) {}
            
            // Step 4: Create enrollment after successful payment
            Map<String, Object> enrollmentRequest = new HashMap<>();
            enrollmentRequest.put("studentId", userId);
            enrollmentRequest.put("courseId", courseId);
            
            Object enrollment = enrollmentServiceClient.createEnrollment(enrollmentRequest);
            response.put("enrollment", enrollment);
            
            response.put("status", "success");
            response.put("message", "Payment workflow completed successfully");
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Payment workflow failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/workflow/user/{userId}/history")
    public ResponseEntity<Map<String, Object>> getUserPaymentHistory(@PathVariable Long userId) {
        Map<String, Object> history = new HashMap<>();
        
        try {
            // Get user profile
            Object user = userServiceClient.getUserProfile(userId);
            history.put("user", user);
            
            // Get user's enrollments
            Object enrollments = enrollmentServiceClient.getByStudent(userId);
            history.put("enrollments", enrollments);
            
            history.put("status", "success");
            history.put("message", "User payment history retrieved successfully");
            
        } catch (Exception e) {
            history.put("status", "error");
            history.put("message", "Failed to retrieve payment history: " + e.getMessage());
        }
        
        return ResponseEntity.ok(history);
    }
}
