-- =====================================================
-- SEED FAKE INVESTORS - USING YOUR GMAIL ADDRESS
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_GMAIL_HERE' with your actual Gmail address
--    Example: If your email is john.smith@gmail.com
--    Replace: 'YOUR_GMAIL_HERE@gmail.com'
--    With: 'john.smith@gmail.com'
-- 2. All investor emails will use Gmail's + trick
--    Example: john.smith+investor1@gmail.com
--    All emails go to YOUR inbox!
-- 3. Run migration 010 first (adds profile JSONB column)
-- 4. Run this script in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create auth users (replace YOUR_GMAIL_HERE with your actual Gmail)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES
  -- Investor 1: AI/ML Specialist
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'YOUR_GMAIL_HERE+investor_ai@gmail.com',
   crypt('demo123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dr. Maria Chen","user_type":"investor"}',
   'authenticated', 'authenticated'),

  -- Investor 2: Healthcare Angel
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'YOUR_GMAIL_HERE+investor_healthcare@gmail.com',
   crypt('demo123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dr. Raj Patel","user_type":"investor"}',
   'authenticated', 'authenticated'),

  -- Investor 3: Climate VC
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'YOUR_GMAIL_HERE+investor_climate@gmail.com',
   crypt('demo123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sophie Anderson","user_type":"investor"}',
   'authenticated', 'authenticated'),

  -- Innovator 1: For testing
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'YOUR_GMAIL_HERE+innovator1@gmail.com',
   crypt('demo123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Alex Johnson","user_type":"startup"}',
   'authenticated', 'authenticated');

-- STEP 2: Update profiles with investor details
UPDATE profiles SET
  company_name = 'Catalyst Ventures',
  role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/women/44.jpg',
  subscription_tier = 'premium',
  cvs_reports_used = 12,
  cvs_reports_limit = 50,
  profile = '{
    "bio": "Early-stage AI/ML investor focused on transformative technologies",
    "domains": ["AI/ML", "Healthcare", "Developer Tools"],
    "min_cvs_threshold": 60,
    "preferred_trl_range": [4, 7],
    "check_size_min": 500000,
    "check_size_max": 3000000,
    "investment_thesis": "Investing in AI infrastructure and applications that solve real-world problems"
  }'::jsonb
WHERE email LIKE '%+investor_ai@gmail.com';

UPDATE profiles SET
  company_name = 'Patel Family Office',
  role = 'Managing Director',
  avatar_url = 'https://randomuser.me/api/portraits/men/32.jpg',
  subscription_tier = 'basic',
  cvs_reports_used = 3,
  cvs_reports_limit = 10,
  profile = '{
    "bio": "Healthcare angel investor with medical background",
    "domains": ["Healthcare", "Biotech", "MedTech"],
    "min_cvs_threshold": 70,
    "preferred_trl_range": [5, 8],
    "check_size_min": 250000,
    "check_size_max": 1000000,
    "investment_thesis": "Patient-centered healthcare innovations"
  }'::jsonb
WHERE email LIKE '%+investor_healthcare@gmail.com';

UPDATE profiles SET
  company_name = 'GreenTech Ventures',
  role = 'Principal',
  avatar_url = 'https://randomuser.me/api/portraits/women/68.jpg',
  subscription_tier = 'enterprise',
  cvs_reports_used = 8,
  cvs_reports_limit = 100,
  profile = '{
    "bio": "Climate tech investor focused on carbon reduction",
    "domains": ["Climate Tech", "Energy", "Sustainability"],
    "min_cvs_threshold": 65,
    "preferred_trl_range": [6, 9],
    "check_size_min": 1000000,
    "check_size_max": 5000000,
    "investment_thesis": "Scalable climate solutions with measurable impact"
  }'::jsonb
WHERE email LIKE '%+investor_climate@gmail.com';

UPDATE profiles SET
  company_name = 'InnovateTech Startup',
  role = 'Founder',
  avatar_url = 'https://randomuser.me/api/portraits/men/75.jpg',
  subscription_tier = 'basic',
  cvs_reports_used = 1,
  cvs_reports_limit = 10
WHERE email LIKE '%+innovator1@gmail.com';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
  full_name,
  email,
  user_type,
  company_name,
  role,
  subscription_tier,
  profile->'domains' AS domains
FROM profiles
WHERE email LIKE '%@gmail.com'
ORDER BY created_at DESC;

-- Expected: 4 rows (3 investors + 1 innovator)

-- =====================================================
-- LOGIN CREDENTIALS (Save these!)
-- =====================================================
-- Replace YOUR_GMAIL_HERE with your actual Gmail before running
--
-- Investor 1 (AI/ML):
--   Email: YOUR_GMAIL_HERE+investor_ai@gmail.com
--   Password: demo123
--
-- Investor 2 (Healthcare):
--   Email: YOUR_GMAIL_HERE+investor_healthcare@gmail.com
--   Password: demo123
--
-- Investor 3 (Climate):
--   Email: YOUR_GMAIL_HERE+investor_climate@gmail.com
--   Password: demo123
--
-- Innovator:
--   Email: YOUR_GMAIL_HERE+innovator1@gmail.com
--   Password: demo123
--
-- All emails will go to YOUR_GMAIL_HERE@gmail.com inbox!
-- =====================================================
