package com.example.api_gateway.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is configured via spring.cloud.gateway.globalcors in application.yml.
 * This config class intentionally does not register a CorsWebFilter bean
 * to avoid duplicate Access-Control-Allow-Origin headers.
 */
@Configuration
public class CorsConfig {
    // Intentionally empty: use YAML-based global CORS config
}