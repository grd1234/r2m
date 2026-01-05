-- =====================================================
-- FAKE INVESTOR PROFILES FOR SMART CURATOR DEMO
-- =====================================================
-- Created: December 14, 2024 (FIXED VERSION)
-- Purpose: Generate realistic investor personas for MVP demo
-- NOTE: This version creates auth.users first, then updates profiles

-- =====================================================
-- APPROACH 1: Create users via Supabase Auth API
-- =====================================================
-- For production use, create users via Supabase Auth API or dashboard
-- This ensures proper auth setup with email confirmation, etc.

-- However, for demo purposes, we can use APPROACH 2 below

-- =====================================================
-- APPROACH 2: Direct insert into auth.users (DEMO ONLY)
-- =====================================================
-- WARNING: This bypasses normal auth flow. Only for demo/testing!
-- In production, use Supabase Auth signup API

-- Step 1: Insert users into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES
  -- 1. AI/ML VC
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_ai_vc@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Maria Chen","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 2. Healthcare Angel
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_healthcare_angel@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Raj Patel","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 3. Climate Tech Corporate VC
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_climate_corp@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sophie Anderson","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 4. Generalist Seed Fund
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_seed_generalist@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"James Lee","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 5. Biotech Specialist
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_biotech_specialist@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Emily Rodriguez","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 6. Enterprise SaaS VC
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_saas_vc@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Michael Zhang","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 7. Impact Investor
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_impact@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Aaliyah Williams","user_type":"investor"}',
    'authenticated',
    'authenticated'
  ),

  -- 8. Corporate R&D
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_corporate_rd@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"David Kim","user_type":"corporate_rd"}',
    'authenticated',
    'authenticated'
  ),

  -- 9. University TTO
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_tto@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Prof. Sarah Johnson","user_type":"tto"}',
    'authenticated',
    'authenticated'
  ),

  -- 10. Accelerator
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'demo+investor_accelerator@infyra.ai',
    crypt('demo_password_123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Martinez","user_type":"innovation_hub"}',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (email) DO NOTHING;

-- Step 2: The handle_new_user() trigger will automatically create profiles
-- Wait a moment for trigger to fire...

-- Step 3: Update profiles with additional details
UPDATE profiles
SET
  company_name = 'Catalyst Ventures',
  role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/women/44.jpg',
  subscription_tier = 'premium',
  cvs_reports_used = 12,
  cvs_reports_limit = 50,
  profile = '{
    "bio": "Early-stage AI/ML investor with deep technical background. Former ML researcher at Google Brain. Seeks novel architectures with strong technical teams.",
    "investment_thesis": "Backing exceptional AI/ML teams solving hard technical problems. Focus on developer tools, ML infrastructure, and applied AI in healthcare.",
    "domains": ["AI/ML", "Healthcare", "Developer Tools", "ML Infrastructure"],
    "min_cvs_threshold": 60,
    "preferred_trl_range": [4, 7],
    "check_size_min": 500000,
    "check_size_max": 3000000,
    "geographic_focus": ["North America", "Europe"],
    "stage_preference": "Seed to Series A"
  }'::jsonb
WHERE email = 'demo+investor_ai_vc@infyra.ai';

UPDATE profiles
SET
  company_name = 'Patel Family Office',
  role = 'Managing Director',
  avatar_url = 'https://randomuser.me/api/portraits/men/32.jpg',
  subscription_tier = 'basic',
  cvs_reports_used = 3,
  cvs_reports_limit = 10,
  profile = '{
    "bio": "Former pharma executive turned angel investor. Led drug discovery teams at Pfizer. Conservative investor seeking high-quality, low-risk opportunities.",
    "investment_thesis": "Proven technologies with clear path to FDA approval. Prefer late-stage preclinical or clinical-stage assets.",
    "domains": ["Healthcare", "Biotech", "Medical Devices"],
    "min_cvs_threshold": 75,
    "preferred_trl_range": [7, 9],
    "check_size_min": 100000,
    "check_size_max": 1000000,
    "geographic_focus": ["US"],
    "stage_preference": "Series A to B"
  }'::jsonb
WHERE email = 'demo+investor_healthcare_angel@infyra.ai';

UPDATE profiles
SET
  company_name = 'GreenTech Ventures (Shell Ventures)',
  role = 'Principal',
  avatar_url = 'https://randomuser.me/api/portraits/women/68.jpg',
  subscription_tier = 'enterprise',
  cvs_reports_used = 8,
  cvs_reports_limit = 100,
  profile = '{
    "bio": "Corporate venture arm of Shell. Focused on decarbonization technologies, renewable energy, and climate adaptation solutions.",
    "investment_thesis": "Strategic investments in climate tech that align with Shell net-zero goals. Prefer capital-efficient solutions with clear ROI.",
    "domains": ["Climate Tech", "Energy", "Carbon Capture", "Materials"],
    "min_cvs_threshold": 65,
    "preferred_trl_range": [5, 8],
    "check_size_min": 2000000,
    "check_size_max": 10000000,
    "geographic_focus": ["Global"],
    "stage_preference": "Series A to C"
  }'::jsonb
WHERE email = 'demo+investor_climate_corp@infyra.ai';

UPDATE profiles
SET
  company_name = 'Seedstage Capital',
  role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/men/22.jpg',
  subscription_tier = 'premium',
  cvs_reports_used = 15,
  cvs_reports_limit = 50,
  profile = '{
    "bio": "Stage-agnostic seed fund investing across verticals. Seek ambitious founders with bold visions. Portfolio includes AI, fintech, biotech, and consumer.",
    "investment_thesis": "Backing exceptional founders regardless of sector. High-risk, high-reward bets. Focus on founder-market fit.",
    "domains": ["AI/ML", "Fintech", "Healthcare", "Consumer", "Enterprise"],
    "min_cvs_threshold": 50,
    "preferred_trl_range": [3, 9],
    "check_size_min": 250000,
    "check_size_max": 2000000,
    "geographic_focus": ["Global"],
    "stage_preference": "Pre-seed to Seed"
  }'::jsonb
WHERE email = 'demo+investor_seed_generalist@infyra.ai';

UPDATE profiles
SET
  company_name = 'BioPharma Angels',
  role = 'Lead Investor',
  avatar_url = 'https://randomuser.me/api/portraits/women/50.jpg',
  subscription_tier = 'pro',
  cvs_reports_used = 6,
  cvs_reports_limit = 25,
  profile = '{
    "bio": "Biotech-focused angel group with 15+ PhD/MD members. Deep technical diligence. Co-invest with top VCs like a16z Bio, Lux Capital.",
    "investment_thesis": "Novel therapeutic modalities, platform technologies, and precision medicine. Seek IP-protected innovations with strong patent portfolios.",
    "domains": ["Biotech", "Pharmaceuticals", "Genomics", "Synthetic Biology"],
    "min_cvs_threshold": 70,
    "preferred_trl_range": [4, 8],
    "check_size_min": 500000,
    "check_size_max": 5000000,
    "geographic_focus": ["US", "Europe"],
    "stage_preference": "Seed to Series B"
  }'::jsonb
WHERE email = 'demo+investor_biotech_specialist@infyra.ai';

UPDATE profiles
SET
  company_name = 'Index Ventures',
  role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/men/18.jpg',
  subscription_tier = 'premium',
  cvs_reports_used = 10,
  cvs_reports_limit = 50,
  profile = '{
    "bio": "Partner at Index Ventures focused on enterprise software. Former Salesforce exec. Seek B2B SaaS with strong unit economics.",
    "investment_thesis": "Enterprise SaaS with $1M+ ARR, <12mo payback, >120% NDR. Prefer vertical SaaS and AI-native products.",
    "domains": ["Enterprise Software", "Developer Tools", "AI/ML", "Vertical SaaS"],
    "min_cvs_threshold": 65,
    "preferred_trl_range": [6, 9],
    "check_size_min": 5000000,
    "check_size_max": 20000000,
    "geographic_focus": ["Global"],
    "stage_preference": "Series A to C"
  }'::jsonb
WHERE email = 'demo+investor_saas_vc@infyra.ai';

UPDATE profiles
SET
  company_name = 'Impact First Capital',
  role = 'Managing Partner',
  avatar_url = 'https://randomuser.me/api/portraits/women/28.jpg',
  subscription_tier = 'basic',
  cvs_reports_used = 4,
  cvs_reports_limit = 10,
  profile = '{
    "bio": "Impact-first investor focused on climate, healthcare access, and education. Seek financial returns + measurable social impact.",
    "investment_thesis": "Technologies addressing UN SDGs. Must demonstrate clear impact metrics (CO2 reduced, lives saved, etc.). Blended value approach.",
    "domains": ["Climate Tech", "Healthcare", "Education", "Agriculture"],
    "min_cvs_threshold": 55,
    "preferred_trl_range": [5, 9],
    "check_size_min": 500000,
    "check_size_max": 3000000,
    "geographic_focus": ["Global"],
    "stage_preference": "Seed to Series A"
  }'::jsonb
WHERE email = 'demo+investor_impact@infyra.ai';

UPDATE profiles
SET
  company_name = 'Samsung Research',
  role = 'VP Innovation Scouting',
  avatar_url = 'https://randomuser.me/api/portraits/men/45.jpg',
  subscription_tier = 'enterprise',
  cvs_reports_used = 20,
  cvs_reports_limit = 100,
  profile = '{
    "bio": "VP of Innovation Scouting at Samsung Research. Seeking IP to acquire or license. Focus on semiconductors, displays, AI chips.",
    "investment_thesis": "Strategic acquisitions and licensing deals. Prefer mature IP with clear freedom-to-operate. Fast decision cycles.",
    "domains": ["AI/ML", "Semiconductors", "Materials", "Optics"],
    "min_cvs_threshold": 70,
    "preferred_trl_range": [7, 9],
    "check_size_min": 1000000,
    "check_size_max": 50000000,
    "geographic_focus": ["Global"],
    "stage_preference": "Series B to Acquisition"
  }'::jsonb
WHERE email = 'demo+investor_corporate_rd@infyra.ai';

UPDATE profiles
SET
  company_name = 'Stanford OTL',
  role = 'Director of Licensing',
  avatar_url = 'https://randomuser.me/api/portraits/women/72.jpg',
  subscription_tier = 'pro',
  cvs_reports_used = 7,
  cvs_reports_limit = 25,
  profile = '{
    "bio": "Director of Licensing at Stanford OTL. Helping faculty commercialize research. Seek industry partners for licensing deals.",
    "investment_thesis": "University spinouts with strong IP protection. Prefer exclusive licensing deals with established companies.",
    "domains": ["Biotech", "AI/ML", "Materials", "Energy"],
    "min_cvs_threshold": 65,
    "preferred_trl_range": [4, 8],
    "check_size_min": 250000,
    "check_size_max": 2000000,
    "geographic_focus": ["US"],
    "stage_preference": "Pre-seed to Seed"
  }'::jsonb
WHERE email = 'demo+investor_tto@infyra.ai';

UPDATE profiles
SET
  company_name = 'Y Combinator',
  role = 'Group Partner',
  avatar_url = 'https://randomuser.me/api/portraits/men/60.jpg',
  subscription_tier = 'premium',
  cvs_reports_used = 18,
  cvs_reports_limit = 50,
  profile = '{
    "bio": "Group Partner at Y Combinator. Invest $500K in every company. Seek exceptional founders building transformative companies.",
    "investment_thesis": "10x thinking. Prefer software-first, capital-efficient businesses. Strong network effects or virality.",
    "domains": ["AI/ML", "Enterprise", "Consumer", "Biotech", "Fintech"],
    "min_cvs_threshold": 50,
    "preferred_trl_range": [3, 9],
    "check_size_min": 500000,
    "check_size_max": 500000,
    "geographic_focus": ["Global"],
    "stage_preference": "Pre-seed"
  }'::jsonb
WHERE email = 'demo+investor_accelerator@infyra.ai';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check auth users created
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY created_at;

-- Check profiles created (via trigger)
SELECT
  full_name,
  email,
  user_type,
  company_name
FROM profiles
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY created_at;

-- Check investor preferences
SELECT
  full_name,
  company_name,
  profile->>'bio' AS bio,
  profile->'domains' AS domains,
  (profile->>'min_cvs_threshold')::int AS min_cvs
FROM profiles
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY full_name;

-- Query investors by domain (test JSONB array search)
SELECT
  full_name,
  company_name,
  profile->'domains' AS domains
FROM profiles
WHERE profile->'domains' ? 'AI/ML'
AND user_type IN ('investor', 'corporate_rd', 'tto', 'innovation_hub');

-- =====================================================
-- SUCCESS CRITERIA
-- =====================================================
-- Expected results:
-- 1. 10 users in auth.users table
-- 2. 10 profiles created automatically via trigger
-- 3. All profiles have detailed JSONB preferences
-- 4. Can query by domain using JSONB operators
-- 5. Ready for Step 3 (Investor Dashboard)
