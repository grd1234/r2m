-- =====================================================
-- ADD PROFILE JSONB COLUMN TO PROFILES TABLE
-- =====================================================
-- Purpose: Add flexible JSONB column for investor preferences
-- Required for: Smart Curator investor matching

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb;

-- Add index for JSONB queries (domain matching)
CREATE INDEX IF NOT EXISTS idx_profiles_profile_domains
ON profiles USING GIN ((profile->'domains'));

-- Verify column added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'profile';
