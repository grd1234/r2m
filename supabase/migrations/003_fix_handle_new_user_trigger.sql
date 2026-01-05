-- Fix handle_new_user() trigger function
-- Created: December 12, 2024
-- Purpose: Fix profile creation trigger to extract metadata from signup

-- =====================================================
-- FIX: handle_new_user() Function
-- =====================================================
-- This function was failing because it didn't extract user_type from metadata
-- user_type is a NOT NULL field in profiles table, causing trigger to fail

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    company_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'startup'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- EXPLANATION
-- =====================================================
-- When users sign up via the UI, they provide metadata:
--   options: {
--     data: {
--       full_name: 'John Doe',
--       user_type: 'startup',
--       company_name: 'Acme Inc',
--       persona: 'innovator'
--     }
--   }
--
-- This metadata is stored in auth.users.raw_user_meta_data as JSONB
-- The trigger extracts it using the ->> operator:
--   NEW.raw_user_meta_data->>'full_name'
--
-- COALESCE provides defaults if metadata is missing:
--   COALESCE(value, default)
--
-- This ensures the NOT NULL constraint on user_type is satisfied

-- =====================================================
-- TESTING
-- =====================================================
-- After running this migration:
-- 1. Try signing up a new user via the UI
-- 2. Check auth.users table (user should be created)
-- 3. Check profiles table (profile should be auto-created)
-- 4. Verify user_type, full_name, company_name are populated

-- Test query to verify trigger works:
-- SELECT
--   u.id,
--   u.email,
--   u.raw_user_meta_data,
--   p.full_name,
--   p.user_type,
--   p.company_name
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON u.id = p.id;
