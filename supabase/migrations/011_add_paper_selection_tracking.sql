-- Migration: Add paper selection tracking columns
-- Date: 2025-12-22
-- Description: Adds columns to track user paper selection and domain preferences
-- Note: Table papers_from_technical_analysis already exists (created in 001_create_core_tables.sql)

-- 1. Add domain tracking to cvs_analyses
ALTER TABLE cvs_analyses
ADD COLUMN IF NOT EXISTS domain TEXT;

-- 2. Add paper selection tracking to cvs_analyses
ALTER TABLE cvs_analyses
ADD COLUMN IF NOT EXISTS auto_selected_paper_id TEXT,
ADD COLUMN IF NOT EXISTS user_overrode_selection BOOLEAN DEFAULT FALSE;

-- 3. Add tags to saved_opportunities for better organization
ALTER TABLE saved_opportunities
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN cvs_analyses.domain IS 'Technology domain selected by user (e.g., Machine Learning, NLP, Computer Vision)';
COMMENT ON COLUMN cvs_analyses.auto_selected_paper_id IS 'Paper ID that was auto-recommended by Technical Agent based on TRL + feasibility';
COMMENT ON COLUMN cvs_analyses.user_overrode_selection IS 'True if user selected a different paper than the auto-recommended one';
COMMENT ON COLUMN saved_opportunities.tags IS 'User-defined tags for organizing saved opportunities';

-- Note: papers_from_technical_analysis table stores analyzed papers with TRL/feasibility scores for user selection
-- Note: research_papers_mp_published table stores papers published to marketplace
