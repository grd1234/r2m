-- Fix profiles table RLS policies
-- Created: December 12, 2024
-- Purpose: Ensure profiles table is accessible for login

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;

-- Recreate policies with correct permissions
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to insert profiles (for signup trigger)
CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- IMPORTANT: Allow anyone to read basic profile info
-- This is needed for marketplace functionality where users
-- view each other's public profiles
CREATE POLICY "Public can view all profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================
-- EXPLANATION
-- =====================================================
-- The key fix is adding "TO anon, authenticated" to the SELECT policy.
-- Without this, anonymous users can't read profiles during login.
--
-- The INSERT policy now uses "TO authenticated" to allow the trigger
-- function (which runs as authenticated) to insert new profiles.
--
-- Test after running:
-- 1. Try logging in - should be able to fetch profile
-- 2. Try viewing other users' profiles - should work
-- 3. Try updating own profile - should work
-- 4. Try updating someone else's profile - should fail
