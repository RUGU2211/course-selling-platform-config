-- Drop unused tables that were removed from course-management-service
-- These tables are no longer needed as their functionality has been removed

USE courses_db;

-- Drop course_content table (moved to content-delivery-service)
DROP TABLE IF EXISTS course_content;

-- Drop category table (removed from course-management-service)
DROP TABLE IF EXISTS category;

-- Verify tables were dropped
SHOW TABLES;

