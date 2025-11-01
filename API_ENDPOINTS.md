# Course Selling Platform - API Endpoints Documentation

## Postman Testing Guide 🚀

### Quick Setup for Postman Testing

#### 1. Import Environment Variables
Create a new environment in Postman with these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | http://localhost:8765 | http://localhost:8765 |
| `gateway_url` | http://localhost:8765 | http://localhost:8765 |
| `frontend_url` | http://localhost:3000 | http://localhost:3000 |
| `token` | | *(leave empty, will be set after login)* |
| `user_id` | | *(leave empty, will be set after login)* |

#### 2. Authentication Flow

**Step 1: Register a New User**
```
POST {{base_url}}/user-management-service/api/users/register
```
**Body (raw JSON):**
```json
{
  "username": "testuser",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "Password123!",
  "role": "STUDENT"
}
```
**Save Response:** Copy the `token` from response → Set in environment variable `token`

**Step 2: Login**
```
POST {{base_url}}/user-management-service/api/users/login
```
**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```
**Save Response:** Copy the `token` → Update environment variable `token`

#### 3. Setting Up Authorization Header

Create a Pre-request Script in Postman:
```javascript
// This automatically adds the Authorization header if token exists
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get("token")
    });
}
```

#### 4. Creating a Collection

Organize your requests into these folders:

```
Course Platform APIs
├── Authentication
│   ├── Register User
│   └── Login User
├── User Management
│   ├── Get Profile
│   ├── Update Profile
│   └── Get Dashboard
├── Course Management
│   ├── Get All Courses
│   ├── Get Course by ID
│   ├── Create Course (Requires Login)
│   ├── Update Course (Requires Login)
│   └── Delete Course (Requires Login)
├── Enrollment
│   ├── Enroll in Course (Requires Login)
│   ├── Get My Enrollments (Requires Login)
│   └── Update Progress (Requires Login)
└── Content
    ├── Get Course Content
    ├── Upload Content (Requires Login)
    └── Stream Content
```

### Testing Workflow

#### Complete User Journey Test

1. **Register** → Get JWT token
2. **Login** → Verify token works
3. **View Courses** → Browse available courses
4. **Enroll in Course** → Enroll in a course
5. **View Enrollments** → Check enrolled courses
6. **Update Progress** → Track learning progress

### Sample Postman Collection JSON

```json
{
  "info": {
    "name": "Course Selling Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8765",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123!\",\n  \"role\": \"STUDENT\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/user-management-service/api/users/register",
              "host": ["{{base_url}}"],
              "path": ["user-management-service", "api", "users", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

### Important Notes for Testing

1. **CORS**: If testing from browser-based Postman, ensure CORS is configured
2. **Gateway**: All requests must go through the API Gateway (port 8765)
3. **JWT Token**: Token expires after a set duration (check your config)
4. **Database**: Ensure MySQL is running and databases are created
5. **Services**: All microservices must be running for complete functionality

### Testing Checklist ✅

- [ ] Register a new user account
- [ ] Login and receive JWT token
- [ ] View list of all courses
- [ ] Get details of a specific course
- [ ] Create a new course (as instructor)
- [ ] Update course details
- [ ] Enroll in a course
- [ ] View my enrollments
- [ ] Get course content
- [ ] Update enrollment progress

### Error Handling

Common error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Validation failed: email is required"
}
```

---

## Base URL
All API calls should be made through the API Gateway at: `http://localhost:8765`

## Service Endpoints

### 1. User Management Service
**Base URL:** `http://localhost:8765/user-management-service/api/users`

#### 1.1 Register User
- **Method:** POST
- **Path:** `/user-management-service/api/users/register`
- **Body:**
```json
{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "role": "STUDENT"
}
```

#### 1.2 Login User
- **Method:** POST
- **Path:** `/user-management-service/api/users/login`
- **Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

#### 1.3 Get User Profile by ID (Authenticated)
- **Method:** GET
- **Path:** `/user-management-service/api/users/profile/{id}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### 1.4 Update User Profile (Authenticated)
- **Method:** PUT
- **Path:** `/user-management-service/api/users/profile/{id}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "fullName": "Johnathan Doe",
  "phone": "555-1234",
  "bio": "Software developer and instructor",
  "profileImage": "http://example.com/image.jpg"
}
```

#### 1.5 Get User Dashboard (Enhanced with Inter-Service Communication)
- **Method:** GET
- **Path:** `/user-management-service/api/users/dashboard/{userId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Description:** Returns user dashboard with enrollments and available courses from other services

---

### 2. Course Management Service
**Base URL:** `http://localhost:8765/course-management-service/api/courses`

#### 2.1 Get All Courses
- **Method:** GET
- **Path:** `/course-management-service/api/courses`

#### 2.2 Get Specific Course by ID
- **Method:** GET
- **Path:** `/course-management-service/api/courses/{courseId}`
- **Example:** `/course-management-service/api/courses/1`

#### 2.3 Create a New Course (Instructor Only)
- **Method:** POST
- **Path:** `/course-management-service/api/courses`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "title": "Java Spring Boot Masterclass",
  "description": "Comprehensive course on Spring Boot development",
  "price": 79.99,
  "duration": "40 hours",
  "categoryId": 1,
  "instructorId": 2
}
```

#### 2.4 Update Course by ID
- **Method:** PUT
- **Path:** `/course-management-service/api/courses/{courseId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "title": "Updated Spring Boot Masterclass",
  "description": "Updated course content",
  "price": 89.99,
  "duration": "45 hours",
  "categoryId": 1,
  "instructorId": 2
}
```

#### 2.5 Delete Course by ID
- **Method:** DELETE
- **Path:** `/course-management-service/api/courses/{courseId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### 2.6 Search Courses (Optional)
- **Method:** GET
- **Path:** `/course-management-service/api/courses/search?query=java&category=programming`

#### 2.7 Add Review to Course
- **Method:** POST
- **Path:** `/course-management-service/api/courses/{courseId}/reviews`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "rating": 5,
  "comment": "Excellent course, highly recommend!"
}
```

#### 2.8 Get Course Analytics (Enhanced with Inter-Service Communication)
- **Method:** GET
- **Path:** `/course-management-service/api/courses/analytics/{courseId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Description:** Returns course analytics including enrollments from enrollment service

#### 2.9 Get Instructor Courses (Enhanced with Inter-Service Communication)
- **Method:** GET
- **Path:** `/course-management-service/api/courses/instructor/{instructorId}/courses`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Description:** Returns instructor profile and courses with user service integration

---

### 3. Enrollment Service
**Base URL:** `http://localhost:8765/enrollment-service/api/enrollments`

#### 3.1 Enroll in a Course
- **Method:** POST
- **Path:** `/enrollment-service/api/enrollments`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "studentId": 1,
  "courseId": 101
}
```

#### 3.2 Get My Enrollments (Authenticated Student)
- **Method:** GET
- **Path:** `/enrollment-service/api/enrollments/student/{studentId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Example:** `/enrollment-service/api/enrollments/student/1`

#### 3.3 Update Enrollment Progress
- **Method:** PUT
- **Path:** `/enrollment-service/api/enrollments/{enrollmentId}/progress`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "progressPercentage": 75,
  "lastAccessedContentId": 555
}
```

#### 3.4 Mark Course Completion
- **Method:** POST
- **Path:** `/enrollment-service/api/enrollments/{enrollmentId}/complete`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### 3.5 Enroll with Validation (Enhanced Inter-Service Workflow)
- **Method:** POST
- **Path:** `/enrollment-service/api/enrollments/workflow/enroll`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Parameters:** `studentId`, `courseId`
- **Description:** Validates student, course, and payment before enrollment

#### 3.6 Get Student Enrollment Summary (Enhanced Inter-Service Communication)
- **Method:** GET
- **Path:** `/enrollment-service/api/enrollments/workflow/student/{studentId}/summary`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Description:** Returns comprehensive student summary with profile and payment data

---

### 4. Content Delivery Service
**Base URL:** `http://localhost:8765/content-delivery-service/api/content`

#### 4.1 Upload Course Content (Instructor Only)
- **Method:** POST
- **Path:** `/content-delivery-service/api/content/{courseId}/upload`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body:** Form data with fields:
  - `file`: (Video or content file upload)
  - `title`: "Lesson 1: Introduction"
  - `description`: "Course introduction video"

#### 4.2 Get All Content for a Course
- **Method:** GET
- **Path:** `/content-delivery-service/api/content/course/{courseId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>` (if protected)
- **Example:** `/content-delivery-service/api/content/course/101`

#### 4.3 Stream Video Content
- **Method:** GET
- **Path:** `/content-delivery-service/api/content/stream/{contentId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>` (if protected)

#### 4.4 Delete Course Content (Instructor Only)
- **Method:** DELETE
- **Path:** `/content-delivery-service/api/content/{contentId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

## Service Discovery & Health Checks

### Eureka Server
- **URL:** `http://localhost:8761`
- **Purpose:** Service discovery and registration

### Health Check Endpoints
All services expose health check endpoints at `/actuator/health`:
- User Service: `http://localhost:8082/actuator/health`
- Course Service: `http://localhost:8083/actuator/health`
- Enrollment Service: `http://localhost:8084/enrollment-service/actuator/health`
- Content Service: `http://localhost:8087/actuator/health`
- API Gateway: `http://localhost:8765/actuator/health`

## Frontend Application
- **URL:** `http://localhost:3000`
- **Purpose:** React-based frontend application

## Database
- **MySQL:** `localhost:3307` (Docker Compose) or `localhost:3306` (K8s)
- **Databases:** 
  - `users_db`
  - `courses_db`
  - `enrollment_db`
  - `content_db`


## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## CORS Configuration
The API Gateway is configured to allow CORS from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`
