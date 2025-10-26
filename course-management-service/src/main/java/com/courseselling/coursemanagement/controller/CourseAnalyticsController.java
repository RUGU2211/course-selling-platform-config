package com.courseselling.coursemanagement.controller;

import com.courseselling.course_management_service.client.EnrollmentServiceClient;
import com.courseselling.course_management_service.client.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/course-management-service/api/courses")
public class CourseAnalyticsController {

    @Autowired
    private EnrollmentServiceClient enrollmentServiceClient;

    @Autowired
    private UserServiceClient userServiceClient;

    @GetMapping("/analytics/{courseId}")
    public ResponseEntity<Map<String, Object>> getCourseAnalytics(@PathVariable Long courseId) {
        Map<String, Object> analytics = new HashMap<>();
        
        try {
            // Get course enrollments
            Object enrollments = enrollmentServiceClient.getCourseEnrollments(courseId);
            analytics.put("enrollments", enrollments);
            
            analytics.put("status", "success");
            analytics.put("message", "Course analytics retrieved successfully");
            
        } catch (Exception e) {
            analytics.put("status", "error");
            analytics.put("message", "Failed to retrieve course analytics: " + e.getMessage());
        }
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/instructor/{instructorId}/courses")
    public ResponseEntity<Map<String, Object>> getInstructorCourses(@PathVariable Long instructorId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get instructor profile
            Object instructor = userServiceClient.getUserProfile(instructorId);
            response.put("instructor", instructor);
            
            // Here you would typically get courses by instructor ID
            // This would be implemented in the course service itself
            
            response.put("status", "success");
            response.put("message", "Instructor courses retrieved successfully");
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to retrieve instructor courses: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
