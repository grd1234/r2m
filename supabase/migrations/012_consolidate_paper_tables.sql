-- Migration: Consolidate Paper Tables
-- Date: 2025-12-22
-- Description: Restructure paper tables for cleaner separation of concerns
--
-- Strategy:
-- 1. Drop existing papers_from_technical_analysis (already exists but not being used)
-- 2. Rename research_papers_mp_published → papers_from_technical_analysis (Technical Agent already writes here)
-- 3. Add analysis tracking columns to papers_from_technical_analysis
-- 4. Create NEW research_papers_mp_published table for marketplace listings only

-- Enable UUID extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Drop existing papers_from_technical_analysis table
-- This table was created in migration 001 but Technical Agent is actually writing to research_papers_mp_published
DROP TABLE IF EXISTS papers_from_technical_analysis CASCADE;

-- Step 2: Rename research_papers_mp_published to papers_from_technical_analysis
-- This table already has all the data from Technical Agent, so we reuse it
ALTER TABLE research_papers_mp_published
RENAME TO papers_from_technical_analysis;

-- Step 3: Add analysis tracking columns
-- These columns link papers to CVS analyses and track relevance scores
ALTER TABLE papers_from_technical_analysis
ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES cvs_analyses(id) ON DELETE CASCADE;

ALTER TABLE papers_from_technical_analysis
ADD COLUMN IF NOT EXISTS relevance_score NUMERIC;

-- Add index for faster queries by analysis_id
CREATE INDEX IF NOT EXISTS idx_papers_technical_analysis_id
ON papers_from_technical_analysis(analysis_id);

-- Add comments
COMMENT ON COLUMN papers_from_technical_analysis.analysis_id IS 'Links paper to CVS analysis (NULL if marketplace paper without analysis)';
COMMENT ON COLUMN papers_from_technical_analysis.relevance_score IS 'Relevance score from Discovery Agent for ranking candidate papers';
COMMENT ON TABLE papers_from_technical_analysis IS 'Stores both candidate papers (for user selection) and published marketplace papers';

-- Step 4: Create NEW research_papers_mp_published table for marketplace listings only
CREATE TABLE research_papers_mp_published (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links back to source paper in papers_from_technical_analysis
  source_paper_id UUID REFERENCES papers_from_technical_analysis(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Paper metadata
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  publication_date DATE,
  year INTEGER,  -- Extracted year for easy display
  citation_count INTEGER DEFAULT 0,
  doi TEXT,

  -- External identifiers
  external_id TEXT,  -- Semantic Scholar ID, arXiv ID, etc.
  source_type TEXT CHECK (source_type IN ('user_upload', 'arxiv', 'semantic_scholar', 'pubmed')),

  -- File storage
  pdf_url TEXT,

  -- Marketplace fields (REQUIRED for published papers)
  marketplace_description TEXT NOT NULL,
  tech_category TEXT NOT NULL,
  industry TEXT,
  stage TEXT,
  funding_goal NUMERIC,

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  interest_count INTEGER DEFAULT 0,

  -- CVS data (from analysis)
  cvs_score INTEGER,
  trl INTEGER,  -- Technology Readiness Level

  -- Additional metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for marketplace queries
CREATE INDEX IF NOT EXISTS idx_research_papers_mp_uploaded_by ON research_papers_mp_published(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_research_papers_mp_tech_category ON research_papers_mp_published(tech_category);
CREATE INDEX IF NOT EXISTS idx_research_papers_mp_published_at ON research_papers_mp_published(published_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_research_papers_mp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_research_papers_mp_published_updated_at
  BEFORE UPDATE ON research_papers_mp_published
  FOR EACH ROW
  EXECUTE FUNCTION update_research_papers_mp_updated_at();

-- Add comments
COMMENT ON TABLE research_papers_mp_published IS 'Published marketplace listings ONLY - created when user clicks "Publish to Marketplace"';
COMMENT ON COLUMN research_papers_mp_published.source_paper_id IS 'Links to original paper in papers_from_technical_analysis';
COMMENT ON COLUMN research_papers_mp_published.marketplace_description IS 'User-written description for marketplace listing';

-- Update saved_opportunities to support both tables
-- (Already has paper_id column that can reference either table)
COMMENT ON COLUMN saved_opportunities.paper_id IS 'Can reference either papers_from_technical_analysis OR research_papers_mp_published';

-- Migration complete
-- Result:
--   - papers_from_technical_analysis: Stores ALL analyzed papers (candidate + published)
--   - research_papers_mp_published: Stores marketplace listings ONLY (separate lifecycle)
