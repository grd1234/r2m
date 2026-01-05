-- Migration: Add inferred_domain to activity_log
-- Date: 2025-12-23
-- Purpose: Add inferred_domain column for AI-inferred research domain tracking

-- Add inferred_domain to activity_log
ALTER TABLE public.activity_log
ADD COLUMN IF NOT EXISTS inferred_domain TEXT;

-- Add index for fast queries by inferred_domain
CREATE INDEX IF NOT EXISTS idx_activity_log_inferred_domain
ON activity_log(inferred_domain);

-- Add comment
COMMENT ON COLUMN activity_log.inferred_domain IS
'AI-inferred research domain based on query analysis. May differ from user-selected domain. Used for improving domain classification accuracy.';

-- Example queries:
--
-- Compare user-selected vs AI-inferred domains:
-- SELECT domain as user_selected, inferred_domain as ai_inferred, COUNT(*) as count
-- FROM activity_log
-- WHERE domain IS NOT NULL AND inferred_domain IS NOT NULL
-- GROUP BY domain, inferred_domain
-- ORDER BY count DESC;
--
-- Find cases where domains differ:
-- SELECT analysis_id, domain, inferred_domain, user_email, created_at
-- FROM activity_log
-- WHERE domain IS NOT NULL
-- AND inferred_domain IS NOT NULL
-- AND domain != inferred_domain
-- ORDER BY created_at DESC;
