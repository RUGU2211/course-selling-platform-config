# Course Selling Platform

A comprehensive microservices-based course selling platform built with Spring Boot, React, and Docker.

## Architecture

This platform consists of the following microservices:

- **API Gateway** (Port 8765) - Central entry point for all API requests
- **Eureka Server** (Port 8761) - Service discovery and registration
- **User Management Service** (Port 8082) - User registration, authentication, and profile management
- **Course Management Service** (Port 8083) - Course creation, management, and reviews
- **Enrollment Service** (Port 8084) - Student course enrollment and progress tracking
- **Payment Service** (Port 8086) - Payment processing and order management
- **Notification Service** (Port 8085) - Email and in-app notifications
- **Content Delivery Service** (Port 8087) - Course content upload and streaming
- **Frontend Application** (Port 3000) - React-based user interface

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for frontend development)

### Running the Platform

#### Option 1: Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

#### Option 2: Using Startup Scripts
- **Linux/Mac:** `./start-platform.sh`
- **Windows:** `start-platform.bat`

### Service URLs

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8765
- **Eureka Server:** http://localhost:8761

### Database
- **MySQL:** localhost:3306

## API Documentation

Complete API endpoints documentation is available in [API_ENDPOINTS.md](API_ENDPOINTS.md).

### Key Endpoints

#### User Management
- `POST /user-management-service/api/users/register` - Register new user
- `POST /user-management-service/api/users/login` - User login
- `GET /user-management-service/api/users/profile/{id}` - Get user profile

#### Course Management
- `GET /course-management-service/api/courses` - Get all courses
- `POST /course-management-service/api/courses` - Create new course
- `GET /course-management-service/api/courses/{id}` - Get course by ID

#### Enrollment
- `POST /enrollment-service/api/enrollments` - Enroll in course
- `GET /enrollment-service/api/enrollments/student/{id}` - Get student enrollments

#### Payment
- `POST /payment-service/api/payments/process` - Process payment
- `GET /payment-service/api/payments/orders/{userId}` - Get purchase history

#### Notifications
- `POST /notification-service/api/notifications/send` - Send notification
- `GET /notification-service/api/notifications/user/{userId}` - Get user notifications

#### Content Delivery
- `POST /content-delivery-service/api/content/{courseId}/upload` - Upload content
- `GET /content-delivery-service/api/content/course/{courseId}` - Get course content

## Development

### Local Development Setup

1. **Start Infrastructure Services:**
   ```bash
   docker-compose up mysql redis rabbitmq eureka-server -d
   ```

2. **Run Individual Services:**
   ```bash
   # User Management Service
   cd user-management-service
   ./mvnw spring-boot:run

   # Course Management Service
   cd course-management-service
   ./mvnw spring-boot:run

   # Continue for other services...
   ```

3. **Run Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Service Configuration

All services are configured to work without a centralized config server. Each service has its own `application.yml` with:
- Direct database connections
- Eureka service discovery
- Health check endpoints
- CORS configuration

## Monitoring

### Health Checks
All services expose health endpoints at `/actuator/health`:
- User Service: http://localhost:8082/actuator/health
- Course Service: http://localhost:8083/actuator/health
- Enrollment Service: http://localhost:8084/actuator/health
- Notification Service: http://localhost:8085/actuator/health
- Payment Service: http://localhost:8086/actuator/health
- Content Service: http://localhost:8087/actuator/health
- API Gateway: http://localhost:8765/actuator/health

### Service Discovery
- Eureka Dashboard: http://localhost:8761

## Features

- **User Management:** Registration, authentication, profile management
- **Course Management:** Create, update, delete courses with reviews
- **Enrollment System:** Student enrollment with progress tracking
- **Payment Processing:** Secure payment handling with Razorpay integration
- **Content Delivery:** Video upload and streaming capabilities
- **Notifications:** Email and in-app notification system
- **Service Discovery:** Automatic service registration and discovery
- **API Gateway:** Centralized routing and load balancing
- **Inter-Service Communication:** Strong backend integration using OpenFeign clients
- **Enhanced Workflows:** Multi-service validation and data aggregation

## Technology Stack

- **Backend:** Spring Boot, Spring Cloud Gateway, Spring Security
- **Frontend:** React, TypeScript, Vite
- **Database:** MySQL
- **Service Discovery:** Netflix Eureka
- **Containerization:** Docker, Docker Compose
- **Payment:** Razorpay integration

## Project Structure

```
course-selling-platform/
├── api-gateway/                 # API Gateway service
├── eureka-server/              # Service discovery
├── user-management-service/    # User management
├── course-management-service/  # Course management
├── enrollmentservice/          # Enrollment service
├── payment/                    # Payment service
├── notification-service/       # Notification service
├── content-delivery-service/   # Content delivery
├── frontend/                  # React frontend
├── docker/                    # Docker configurations
├── docker-compose.yml         # Docker Compose setup
└── API_ENDPOINTS.md          # API documentation
```

## Troubleshooting

### Common Issues

1. **Services not starting:**
   ```bash
   docker-compose logs [service-name]
   ```

2. **Database connection issues:**
   - Ensure MySQL container is running
   - Check database credentials in service configurations

3. **Service discovery issues:**
   - Verify Eureka server is running
   - Check service registration in Eureka dashboard

4. **Frontend not loading:**
   - Ensure API Gateway is running
   - Check CORS configuration

### Useful Commands

```bash
# View all running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 