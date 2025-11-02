-- Drop certificate_url column from enrollments table
-- This field has been removed from the Enrollment entity and DTOs

USE enrollment_db;

-- Drop certificate_url column
ALTER TABLE enrollments DROP COLUMN IF EXISTS certificate_url;

-- Verify column was dropped
DESCRIBE enrollments;

