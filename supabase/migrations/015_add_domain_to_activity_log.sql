-- Migration: Add domain to activity_log
-- Date: 2025-12-23
-- Purpose: Add domain column for easier filtering and analysis by research domain

-- Add domain to activity_log
ALTER TABLE public.activity_log
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Add index for fast queries by domain
CREATE INDEX IF NOT EXISTS idx_activity_log_domain
ON activity_log(domain);

-- Add comment
COMMENT ON COLUMN activity_log.domain IS
'Research domain for the analysis (e.g., "Computer Science", "NLP", "Manufacturing and AI/ML"). Stored denormalized for easier filtering and reporting.';

-- Example queries:
--
-- Get all activity for a specific domain:
-- SELECT workflow_name, action, user_email, notes, created_at
-- FROM activity_log
-- WHERE domain = 'Computer Science'
-- ORDER BY created_at DESC;
--
-- Count analyses by domain:
-- SELECT domain, COUNT(DISTINCT analysis_id) as analysis_count
-- FROM activity_log
-- WHERE domain IS NOT NULL AND analysis_id IS NOT NULL
-- GROUP BY domain
-- ORDER BY analysis_count DESC;
