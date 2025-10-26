# Course Selling Platform - API Endpoints Documentation

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
  "fullName": "John Doe",
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

### 4. Payment Service
**Base URL:** `http://localhost:8765/payment-service/api/payments`

#### 4.1 Process a Payment
- **Method:** POST
- **Path:** `/payment-service/api/payments/process`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "orderId": 123,
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "txn_4567890",
  "amount": 99.99
}
```

#### 4.2 Create Payment (Order)
- **Method:** POST
- **Path:** `/payment-service/api/payments/process`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "userId": 1,
  "courseId": 101,
  "amount": 99.99,
  "paymentMethod": "CREDIT_CARD"
}
```

#### 4.3 Get Purchase History for a User
- **Method:** GET
- **Path:** `/payment-service/api/payments/orders/{userId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Example:** `/payment-service/api/payments/orders/1`

#### 4.4 Process a Refund
- **Method:** POST
- **Path:** `/payment-service/api/payments/refund?orderId=789`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "paymentId": 789,
  "reason": "Course cancellation"
}
```

#### 4.5 Get Payment Details by ID
- **Method:** GET
- **Path:** `/payment-service/api/payments/{paymentId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Example:** `/payment-service/api/payments/789`

#### 4.6 Process Payment with Validation (Enhanced Inter-Service Workflow)
- **Method:** POST
- **Path:** `/payment-service/api/payments/workflow/process`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Parameters:** `userId`, `courseId`, `amount`
- **Description:** Validates user and course, processes payment, and creates enrollment

#### 4.7 Get User Payment History (Enhanced Inter-Service Communication)
- **Method:** GET
- **Path:** `/payment-service/api/payments/workflow/user/{userId}/history`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Description:** Returns comprehensive payment history with user profile and enrollments

---

### 5. Notification Service
**Base URL:** `http://localhost:8765/notification-service/api/notifications`

#### 5.1 Send a Notification
- **Method:** POST
- **Path:** `/notification-service/api/notifications/send`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "userId": 1,
  "title": "Course Completion",
  "message": "Congratulations on completing your course!",
  "type": "EMAIL"
}
```

#### 5.2 Get Notifications for a User
- **Method:** GET
- **Path:** `/notification-service/api/notifications/user/{userId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Example:** `/notification-service/api/notifications/user/1`

#### 5.3 Mark Notification as Read
- **Method:** PUT
- **Path:** `/notification-service/api/notifications/{notificationId}/read`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Example:** `/notification-service/api/notifications/10/read`

#### 5.4 Delete a Notification
- **Method:** DELETE
- **Path:** `/notification-service/api/notifications/{notificationId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

### 6. Content Delivery Service
**Base URL:** `http://localhost:8765/content-delivery-service/api/content`

#### 6.1 Upload Course Content (Instructor Only)
- **Method:** POST
- **Path:** `/content-delivery-service/api/content/{courseId}/upload`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body:** Form data with fields:
  - `file`: (Video or content file upload)
  - `title`: "Lesson 1: Introduction"
  - `description`: "Course introduction video"

#### 6.2 Get All Content for a Course
- **Method:** GET
- **Path:** `/content-delivery-service/api/content/course/{courseId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>` (if protected)
- **Example:** `/content-delivery-service/api/content/course/101`

#### 6.3 Stream Video Content
- **Method:** GET
- **Path:** `/content-delivery-service/api/content/stream/{contentId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>` (if protected)

#### 6.4 Delete Course Content (Instructor Only)
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
- Enrollment Service: `http://localhost:8084/actuator/health`
- Notification Service: `http://localhost:8085/actuator/health`
- Payment Service: `http://localhost:8086/actuator/health`
- Content Service: `http://localhost:8087/actuator/health`
- API Gateway: `http://localhost:8765/actuator/health`

## Frontend Application
- **URL:** `http://localhost:3000`
- **Purpose:** React-based frontend application

## Database
- **MySQL:** `localhost:3306`
- **Databases:** 
  - `users_db`
  - `courses_db`
  - `enrollment_db`
  - `notification_db`
  - `payment_db`
  - `content_db`

## Additional Services
- **MySQL Database:** `localhost:3306` (Primary database)

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
