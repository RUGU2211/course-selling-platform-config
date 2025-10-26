package com.courseselling.course_management_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-management-service")
public interface UserServiceClient {
    
    @GetMapping("/user-management-service/api/users/profile/{userId}")
    Object getUserProfile(@PathVariable("userId") Long userId);
    
    @GetMapping("/user-management-service/api/users/{userId}")
    Object getUserById(@PathVariable("userId") Long userId);
}
