package com.courseplatform.user_management_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "enrollmentservice")
public interface EnrollmentServiceClient {
    
    @GetMapping("/enrollment-service/api/enrollments/student/{studentId}")
    Object getStudentEnrollments(@PathVariable("studentId") Long studentId);
}
