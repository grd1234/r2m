-- ================================================================
-- FIX CVS_ANALYSES RLS FOR CLIENT-SIDE ACCESS
-- Purpose: Allow authenticated users to read their own CVS analyses
-- Date: 2026-01-06
-- ================================================================

-- Enable RLS on cvs_analyses (if not already enabled)
ALTER TABLE public.cvs_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own analyses" ON public.cvs_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.cvs_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.cvs_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.cvs_analyses;

-- Policy: Allow users to read their own analyses (by email)
CREATE POLICY "Users can read their own analyses"
ON public.cvs_analyses
FOR SELECT
TO authenticated
USING (analyzed_by = auth.jwt() ->> 'email');

-- Policy: Allow users to insert analyses
CREATE POLICY "Users can insert their own analyses"
ON public.cvs_analyses
FOR INSERT
TO authenticated
WITH CHECK (analyzed_by = auth.jwt() ->> 'email');

-- Policy: Allow users to update their own analyses
CREATE POLICY "Users can update their own analyses"
ON public.cvs_analyses
FOR UPDATE
TO authenticated
USING (analyzed_by = auth.jwt() ->> 'email')
WITH CHECK (analyzed_by = auth.jwt() ->> 'email');

-- Policy: Allow users to delete their own analyses
CREATE POLICY "Users can delete their own analyses"
ON public.cvs_analyses
FOR DELETE
TO authenticated
USING (analyzed_by = auth.jwt() ->> 'email');

-- Allow anon role to insert (for N8N)
GRANT INSERT, UPDATE ON public.cvs_analyses TO anon;

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'RLS policies created for cvs_analyses table';
END $$;
