package com.example.eurekaserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
	"eureka.client.enabled=false",
	"eureka.server.enabled=false"
})
@ActiveProfiles("test")
class EurekaServerApplicationTests {

	@Test
	void contextLoads() {
		// Test that Spring context can load without Eureka components
		// When eureka.client.enabled=false and eureka.server.enabled=false,
		// the application should still load basic Spring Boot context
	}

}
