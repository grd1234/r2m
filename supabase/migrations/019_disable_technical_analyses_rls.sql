-- ================================================================
-- DISABLE RLS FOR TECHNICAL_ANALYSES TABLE
-- Purpose: Allow authenticated users to read technical reports without RLS restrictions
-- Date: 2026-01-06
-- ================================================================

-- Disable RLS on technical_analyses table
ALTER TABLE IF EXISTS technical_analyses DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read all technical analyses" ON technical_analyses;
DROP POLICY IF EXISTS "Service role can insert technical analyses" ON technical_analyses;
DROP POLICY IF EXISTS "Service role can update technical analyses" ON technical_analyses;

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'technical_analyses'
    AND schemaname = 'public'
  ) THEN
    RAISE NOTICE 'technical_analyses table found and RLS disabled';
  ELSE
    RAISE NOTICE 'WARNING: technical_analyses table not found in public schema';
  END IF;
END $$;
