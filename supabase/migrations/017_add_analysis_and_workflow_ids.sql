-- ================================================================
-- ADD ANALYSIS_ID AND WORKFLOW_ID TO CVS_ANALYSES
-- Purpose: Track n8n workflow execution IDs and analysis identifiers
-- Date: 2026-01-02
-- ================================================================

-- Add analysis_id column
-- This stores a unique analysis identifier from the n8n workflow
ALTER TABLE cvs_analyses
ADD COLUMN IF NOT EXISTS analysis_id TEXT;

-- Add workflow_id column
-- This stores the n8n workflow execution ID for traceability
ALTER TABLE cvs_analyses
ADD COLUMN IF NOT EXISTS workflow_id TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cvs_analyses_analysis_id ON cvs_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_cvs_analyses_workflow_id ON cvs_analyses(workflow_id);

-- Add comments for documentation
COMMENT ON COLUMN cvs_analyses.analysis_id IS 'Unique analysis identifier from n8n workflow';
COMMENT ON COLUMN cvs_analyses.workflow_id IS 'n8n workflow execution ID for traceability';

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cvs_analyses'
AND column_name IN ('analysis_id', 'workflow_id')
ORDER BY column_name;
