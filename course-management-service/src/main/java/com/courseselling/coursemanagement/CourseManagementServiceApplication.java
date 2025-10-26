package com.courseselling.coursemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import com.courseselling.course_management_service.client.EnrollmentServiceClient;
import com.courseselling.course_management_service.client.UserServiceClient;

@EnableDiscoveryClient
@EnableFeignClients(basePackageClasses = {EnrollmentServiceClient.class, UserServiceClient.class})
@SpringBootApplication
public class CourseManagementServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(CourseManagementServiceApplication.class, args);
	}
}
