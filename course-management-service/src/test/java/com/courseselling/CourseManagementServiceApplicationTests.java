package com.courseselling;

import com.courseselling.coursemanagement.CourseManagementServiceApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = CourseManagementServiceApplication.class)
@ActiveProfiles("test")
class CourseManagementServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
