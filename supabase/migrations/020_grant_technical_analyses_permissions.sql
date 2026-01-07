-- ================================================================
-- GRANT EXPLICIT PERMISSIONS FOR TECHNICAL_ANALYSES TABLE
-- Purpose: Ensure all roles can access technical_analyses table
-- Date: 2026-01-06
-- ================================================================

-- Disable RLS completely
ALTER TABLE public.technical_analyses DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read all technical analyses" ON public.technical_analyses;
DROP POLICY IF EXISTS "Service role can insert technical analyses" ON public.technical_analyses;
DROP POLICY IF EXISTS "Service role can update technical analyses" ON public.technical_analyses;

-- Grant explicit SELECT permission to all roles
GRANT SELECT ON public.technical_analyses TO anon;
GRANT SELECT ON public.technical_analyses TO authenticated;
GRANT SELECT ON public.technical_analyses TO service_role;

-- Grant INSERT and UPDATE to anon (for N8N webhook)
GRANT INSERT ON public.technical_analyses TO anon;
GRANT UPDATE ON public.technical_analyses TO anon;
GRANT INSERT ON public.technical_analyses TO authenticated;
GRANT UPDATE ON public.technical_analyses TO authenticated;

-- Grant ALL to service_role
GRANT ALL ON public.technical_analyses TO service_role;

-- Verify table exists and show current permissions
DO $$
BEGIN
  RAISE NOTICE 'Permissions granted for public.technical_analyses';
  RAISE NOTICE 'RLS is now: %', (
    SELECT CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'technical_analyses'
  );
END $$;
