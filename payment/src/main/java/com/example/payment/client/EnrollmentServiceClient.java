package com.example.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "enrollmentservice")
public interface EnrollmentServiceClient {
    
    @PostMapping("/api/enrollments")
    Object createEnrollment(@RequestBody Object enrollmentRequest);
    
    @GetMapping("/api/enrollments/student/{studentId}")
    Object getByStudent(@PathVariable Long studentId);
}
