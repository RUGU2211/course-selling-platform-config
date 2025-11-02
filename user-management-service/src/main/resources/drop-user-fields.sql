-- Drop bio, phone, and profile_image columns from users table
-- These fields have been removed from the User entity and DTOs

USE users_db;

-- Drop bio column (TEXT column)
ALTER TABLE users DROP COLUMN IF EXISTS bio;

-- Drop phone column
ALTER TABLE users DROP COLUMN IF EXISTS phone;

-- Drop profile_image column
ALTER TABLE users DROP COLUMN IF EXISTS profile_image;

-- Verify columns were dropped
DESCRIBE users;

