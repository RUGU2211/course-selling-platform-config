# API Gateway Eureka Registration Fix

## Problem
The API Gateway was not registering with Eureka when running locally because:
1. The default configuration used Docker hostname `course-platform-eureka` which doesn't resolve on localhost
2. Missing Eureka instance configuration for proper registration

## Solution Applied

### Changes Made:
1. **Updated `application.properties`** - Changed Eureka URL to `localhost` for local development
2. **Added Eureka Instance Configuration** - Proper hostname and instance ID settings
3. **Updated `application-local.yml`** - Enabled Eureka client (was disabled)

### Configuration:
- **Eureka Server URL**: `http://localhost:8761/eureka/` (for local) or `http://course-platform-eureka:8761/eureka/` (for Docker)
- **Instance Hostname**: `localhost`
- **Instance ID**: `${spring.application.name}:${server.port}` (e.g., `api-gateway:8765`)

## How to Run Locally

### Option 1: Use default configuration (recommended)
```bash
# Just run the application - it will use localhost automatically
mvn spring-boot:run
```

### Option 2: Use local profile
```bash
# Activate local profile
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

## For Docker Deployment

When running in Docker, set environment variable:
```yaml
environment:
  - EUREKA_CLIENT_SERVICE_URL=http://course-platform-eureka:8761/eureka/
```

Or create `application-docker.properties`:
```properties
eureka.client.service-url.defaultZone=http://course-platform-eureka:8761/eureka/
eureka.instance.hostname=${HOSTNAME}
```

## Verify Registration

1. Start Eureka Server on `http://localhost:8761`
2. Start API Gateway
3. Check Eureka Dashboard at `http://localhost:8761`
4. Look for `API-GATEWAY` service registered

## Troubleshooting

If still not registering:
1. Check Eureka Server is running on port 8761
2. Verify no firewall blocking connections
3. Check logs for Eureka connection errors
4. Verify `@EnableDiscoveryClient` annotation is present
5. Check Spring Cloud Gateway and Eureka dependencies in `pom.xml`

