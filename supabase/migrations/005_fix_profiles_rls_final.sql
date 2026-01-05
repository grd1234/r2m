-- Fix profiles table RLS policies - Final Version
-- Created: December 13, 2024
-- Purpose: Ensure profiles table is accessible for login

-- Drop ALL existing policies (including ones with different names)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- Create fresh policies with correct permissions

-- 1. Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. Allow authenticated users to insert profiles (for signup trigger)
CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. CRITICAL: Allow everyone to read all profiles (needed for marketplace and login)
CREATE POLICY "Public can view all profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify policies are created correctly:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'profiles';
