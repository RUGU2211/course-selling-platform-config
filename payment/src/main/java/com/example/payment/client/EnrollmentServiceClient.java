package com.example.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "enrollmentservice")
public interface EnrollmentServiceClient {
    
    @PostMapping("/enrollment-service/api/enrollments")
    Object createEnrollment(@RequestBody Object enrollmentRequest);
}
