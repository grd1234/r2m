-- Migration: Add analysis_id to activity_log and error_log
-- Date: 2025-12-23
-- Purpose: Link activity and error log entries to CVS analyses for progress tracking and debugging

-- Add analysis_id to activity_log
ALTER TABLE public.activity_log
ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES cvs_analyses(id) ON DELETE SET NULL;

-- Add index for fast queries by analysis_id
CREATE INDEX IF NOT EXISTS idx_activity_log_analysis_id
ON activity_log(analysis_id);

-- Add comment
COMMENT ON COLUMN activity_log.analysis_id IS
'Links activity log entries to CVS analysis for real-time progress tracking. NULL for non-analysis activities.';

-- Add analysis_id to error_log
ALTER TABLE public.error_log
ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES cvs_analyses(id) ON DELETE SET NULL;

-- Add index for fast error queries by analysis_id
CREATE INDEX IF NOT EXISTS idx_error_log_analysis_id
ON error_log(analysis_id);

-- Add comment
COMMENT ON COLUMN error_log.analysis_id IS
'Links error log entries to CVS analysis for debugging failed analyses. NULL for non-analysis errors.';

-- Example queries:
--
-- Get progress for an analysis:
-- SELECT workflow_name, action, notes, created_at
-- FROM activity_log
-- WHERE analysis_id = 'uuid-here'
-- ORDER BY created_at ASC;
--
-- Get errors for a failed analysis:
-- SELECT workflow_name, error_type, error_message, created_at
-- FROM error_log
-- WHERE analysis_id = 'uuid-here'
-- ORDER BY created_at ASC;
