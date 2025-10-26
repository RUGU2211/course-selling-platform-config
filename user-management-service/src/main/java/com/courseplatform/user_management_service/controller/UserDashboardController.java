package com.courseplatform.user_management_service.controller;

import com.courseplatform.user_management_service.client.CourseServiceClient;
import com.courseplatform.user_management_service.client.EnrollmentServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user-management-service/api/users")
@CrossOrigin(origins = "*")
public class UserDashboardController {

    @Autowired
    private CourseServiceClient courseServiceClient;

    @Autowired
    private EnrollmentServiceClient enrollmentServiceClient;

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDashboard(@PathVariable Long userId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        try {
            // Get user's enrolled courses
            Object enrollments = enrollmentServiceClient.getStudentEnrollments(userId);
            dashboard.put("enrollments", enrollments);
            
            // Get all available courses
            Object courses = courseServiceClient.getAllCourses();
            dashboard.put("availableCourses", courses);
            
            dashboard.put("status", "success");
            dashboard.put("message", "Dashboard data retrieved successfully");
            
        } catch (Exception e) {
            dashboard.put("status", "error");
            dashboard.put("message", "Failed to retrieve dashboard data: " + e.getMessage());
        }
        
        return ResponseEntity.ok(dashboard);
    }
}
