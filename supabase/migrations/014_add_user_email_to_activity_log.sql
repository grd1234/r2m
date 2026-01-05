-- Migration: Add user_email to activity_log
-- Date: 2025-12-23
-- Purpose: Add user_email column for easier debugging and tracking without needing joins

-- Add user_email to activity_log
ALTER TABLE public.activity_log
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Add index for fast queries by user_email
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email
ON activity_log(user_email);

-- Add comment
COMMENT ON COLUMN activity_log.user_email IS
'Email of the user who triggered the workflow. Stored denormalized for easier debugging and tracking.';

-- Example queries:
--
-- Get all activity for a user by email:
-- SELECT workflow_name, action, notes, created_at
-- FROM activity_log
-- WHERE user_email = 'user@example.com'
-- ORDER BY created_at DESC;
--
-- Get activity for specific analysis with user info:
-- SELECT workflow_name, action, user_email, notes, created_at
-- FROM activity_log
-- WHERE analysis_id = 'uuid-here'
-- ORDER BY created_at ASC;
