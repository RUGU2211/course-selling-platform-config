-- Create all databases
CREATE DATABASE IF NOT EXISTS users_db;
CREATE DATABASE IF NOT EXISTS courses_db;
CREATE DATABASE IF NOT EXISTS enrollment_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS content_db;

-- Use users_db and create test data
USE users_db;

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       first_name VARCHAR(50) NOT NULL,
                       last_name VARCHAR(50) NOT NULL,
                       role ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN') DEFAULT 'STUDENT',
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
                                                                               ('john_doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Doe', 'STUDENT'),
                                                                               ('jane_instructor', 'jane@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane', 'Smith', 'INSTRUCTOR'),
                                                                               ('admin_user', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'ADMIN');

-- Use courses_db and create test data
USE courses_db;

CREATE TABLE courses (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         title VARCHAR(255) NOT NULL,
                         description TEXT,
                         instructor_id BIGINT NOT NULL,
                         price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                         status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'PUBLISHED',
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO courses (title, description, instructor_id, price) VALUES
                                                                   ('Java Programming Basics', 'Learn Java from scratch', 2, 99.99),
                                                                   ('React.js Fundamentals', 'Build modern web apps with React', 2, 89.99),
                                                                   ('Free Python Course', 'Learn Python basics for free', 2, 0.00);

-- Use enrollment_db and create test data
USE enrollment_db;

CREATE TABLE enrollments (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             student_id BIGINT NOT NULL,
                             course_id BIGINT NOT NULL,
                             enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
                             progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
                             UNIQUE KEY unique_student_course (student_id, course_id)
);

INSERT INTO enrollments (student_id, course_id, progress_percentage) VALUES
                                                                         (1, 1, 25.50),
                                                                         (1, 3, 100.00);

-- Use payment_db and create test data
USE payment_db;

CREATE TABLE payments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          user_id BIGINT NOT NULL,
                          course_id BIGINT NOT NULL,
                          amount DECIMAL(10, 2) NOT NULL,
                          status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
                          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payments (user_id, course_id, amount) VALUES
    (1, 1, 99.99);

-- Use notification_db and create test data
USE notification_db;

CREATE TABLE notifications (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               message TEXT NOT NULL,
                               type ENUM('EMAIL', 'SMS', 'PUSH') DEFAULT 'EMAIL',
                               status ENUM('PENDING', 'SENT', 'DELIVERED') DEFAULT 'DELIVERED',
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notifications (user_id, message) VALUES
                                                 (1, 'Welcome to Course Platform!'),
                                                 (1, 'You have successfully enrolled in Java Programming Basics');

-- Use content_db and create test data
USE content_db;

CREATE TABLE files (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       filename VARCHAR(255) NOT NULL,
                       file_path VARCHAR(500) NOT NULL,
                       file_size BIGINT NOT NULL,
                       course_id BIGINT,
                       uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO files (filename, file_path, file_size, course_id) VALUES
                                                                  ('java_intro.mp4', '/content/videos/java_intro.mp4', 52428800, 1),
                                                                  ('react_basics.mp4', '/content/videos/react_basics.mp4', 41943040, 2);
