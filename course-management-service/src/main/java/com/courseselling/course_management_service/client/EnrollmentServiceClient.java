package com.courseselling.course_management_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "enrollmentservice")
public interface EnrollmentServiceClient {
    
    @GetMapping("/enrollment-service/api/enrollments/course/{courseId}")
    Object getCourseEnrollments(@PathVariable("courseId") Long courseId);
}
