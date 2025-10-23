# Course Selling Platform - Configuration Files

This repository contains the centralized configuration files for the Course Selling Platform microservices architecture.


## Services Configuration

### 1. User Management Service
- **File**: `user-management-service.yml`
- **Port**: 8082
- **Database**: users_db
- **Features**: JWT authentication, user CRUD operations

### 2. Course Management Service
- **File**: `course-management-service.yml`
- **Port**: 8083
- **Database**: courses_db
- **Features**: Course CRUD, JWT validation

### 3. Payment Service
- **File**: `payment-service.yml`
- **Port**: 8086
- **Database**: payment_db
- **Features**: Razorpay integration, payment processing

### 4. Enrollment Service
- **File**: `enrollmentservice.yml`
- **Port**: 8084
- **Database**: enrollment_db
- **Features**: Course enrollment management

### 5. Notification Service
- **File**: `notification-service.yml`
- **Port**: 8085
- **Database**: notification_db
- **Features**: User notifications, email services

### 6. Content Delivery Service
- **File**: `content-delivery-service.yml`
- **Port**: 8087
- **Database**: content_db
- **Features**: Course content management

### 7. API Gateway
- **File**: `api-gateway.yml`
- **Port**: 8765
- **Features**: Service discovery, routing, load balancing

### 8. Eureka Server
- **File**: `eureka-server.yml`
- **Port**: 8761
- **Features**: Service discovery and registration

## Configuration Server Integration

These configuration files are used by the Spring Cloud Config Server to provide centralized configuration management for all microservices.

### Config Server URL
http://config-server:8888

### Accessing Service ConfigurationsGet specific service configuration
GET http://config-server:8888/{service-name}/{profile}
Examples:
GET http://config-server:8888/user-management-service/default
GET http://config-server:8888/payment-service/default
GET http://config-server:8888/api-gateway/default

## Environment Variables

For production deployment, the following environment variables should be set:
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `RAZORPAY_KEY_ID`: Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Razorpay API secret

## Docker Integration

All services are configured to work with Docker Compose:
- **Eureka Server**: `eureka-server:8761`
- **Config Server**: `config-server:8888`
- **MySQL Database**: `mysql:3306`

## Security Notes

⚠️ **Important**: The configuration files contain test credentials and should be updated for production use:
- Change JWT secrets
- Update Razorpay credentials
- Use environment variables for sensitive data
- Implement proper security measures

## Usage

1. Clone this repository
2. Update the Config Server to point to this repository
3. Deploy the microservices
4. Services will automatically fetch their configurations from this repository

## Support

For questions or issues, please contact the development team.