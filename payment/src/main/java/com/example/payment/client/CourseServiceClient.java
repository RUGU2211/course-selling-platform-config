package com.example.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "course-management-service")
public interface CourseServiceClient {
    
    @GetMapping("/course-management-service/api/courses/{courseId}")
    Object getCourseById(@PathVariable("courseId") Long courseId);
}
