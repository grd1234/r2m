-- =====================================================
-- FAKE INVESTOR PROFILES FOR SMART CURATOR DEMO
-- =====================================================
-- Created: December 14, 2024
-- Purpose: Generate realistic investor personas for MVP demo
-- Execute in: Supabase SQL Editor

-- =====================================================
-- STEP 1: INSERT 10 FAKE INVESTOR PROFILES
-- =====================================================

INSERT INTO profiles (
  id,
  email,
  full_name,
  user_type,
  company_name,
  role,
  avatar_url,
  subscription_tier,
  subscription_status,
  cvs_reports_used,
  cvs_reports_limit,
  created_at
)
VALUES
  -- 1. Early-stage AI/ML VC (aggressive, high volume)
  (
    gen_random_uuid(),
    'demo+investor_ai_vc@infyra.ai',
    'Dr. Maria Chen',
    'investor',
    'Catalyst Ventures',
    'Partner',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'premium',
    'active',
    12,
    50,
    NOW()
  ),

  -- 2. Healthcare-focused angel investor (conservative, high CVS threshold)
  (
    gen_random_uuid(),
    'demo+investor_healthcare_angel@infyra.ai',
    'Dr. Raj Patel',
    'investor',
    'Patel Family Office',
    'Managing Director',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'basic',
    'active',
    3,
    10,
    NOW()
  ),

  -- 3. Climate tech corporate VC (medium risk tolerance)
  (
    gen_random_uuid(),
    'demo+investor_climate_corp@infyra.ai',
    'Sophie Anderson',
    'investor',
    'GreenTech Ventures (Shell Ventures)',
    'Principal',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'enterprise',
    'active',
    8,
    100,
    NOW()
  ),

  -- 4. Generalist seed fund (broad interests)
  (
    gen_random_uuid(),
    'demo+investor_seed_generalist@infyra.ai',
    'James Lee',
    'investor',
    'Seedstage Capital',
    'Partner',
    'https://randomuser.me/api/portraits/men/22.jpg',
    'premium',
    'active',
    15,
    50,
    NOW()
  ),

  -- 5. Biotech specialist (deep domain expertise)
  (
    gen_random_uuid(),
    'demo+investor_biotech_specialist@infyra.ai',
    'Dr. Emily Rodriguez',
    'investor',
    'BioPharma Angels',
    'Lead Investor',
    'https://randomuser.me/api/portraits/women/50.jpg',
    'pro',
    'active',
    6,
    25,
    NOW()
  ),

  -- 6. Enterprise SaaS VC (B2B focus)
  (
    gen_random_uuid(),
    'demo+investor_saas_vc@infyra.ai',
    'Michael Zhang',
    'investor',
    'Index Ventures',
    'Partner',
    'https://randomuser.me/api/portraits/men/18.jpg',
    'premium',
    'active',
    10,
    50,
    NOW()
  ),

  -- 7. Impact investor (social + financial returns)
  (
    gen_random_uuid(),
    'demo+investor_impact@infyra.ai',
    'Aaliyah Williams',
    'investor',
    'Impact First Capital',
    'Managing Partner',
    'https://randomuser.me/api/portraits/women/28.jpg',
    'basic',
    'active',
    4,
    10,
    NOW()
  ),

  -- 8. Corporate R&D (looking for IP to acquire)
  (
    gen_random_uuid(),
    'demo+investor_corporate_rd@infyra.ai',
    'David Kim',
    'corporate_rd',
    'Samsung Research',
    'VP Innovation Scouting',
    'https://randomuser.me/api/portraits/men/45.jpg',
    'enterprise',
    'active',
    20,
    100,
    NOW()
  ),

  -- 9. University TTO (tech transfer office)
  (
    gen_random_uuid(),
    'demo+investor_tto@infyra.ai',
    'Prof. Sarah Johnson',
    'tto',
    'Stanford OTL',
    'Director of Licensing',
    'https://randomuser.me/api/portraits/women/72.jpg',
    'pro',
    'active',
    7,
    25,
    NOW()
  ),

  -- 10. Innovation hub / accelerator
  (
    gen_random_uuid(),
    'demo+investor_accelerator@infyra.ai',
    'Alex Martinez',
    'innovation_hub',
    'Y Combinator',
    'Group Partner',
    'https://randomuser.me/api/portraits/men/60.jpg',
    'premium',
    'active',
    18,
    50,
    NOW()
  );

-- =====================================================
-- STEP 2: UPDATE INVESTOR PROFILES WITH PREFERENCES
-- =====================================================

-- 1. AI/ML VC
UPDATE profiles
SET profile = '{
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

-- 2. Healthcare Angel
UPDATE profiles
SET profile = '{
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

-- 3. Climate Tech Corporate VC
UPDATE profiles
SET profile = '{
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

-- 4. Generalist Seed Fund
UPDATE profiles
SET profile = '{
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

-- 5. Biotech Specialist
UPDATE profiles
SET profile = '{
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

-- 6. Enterprise SaaS VC
UPDATE profiles
SET profile = '{
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

-- 7. Impact Investor
UPDATE profiles
SET profile = '{
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

-- 8. Corporate R&D
UPDATE profiles
SET profile = '{
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

-- 9. University TTO
UPDATE profiles
SET profile = '{
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

-- 10. Accelerator
UPDATE profiles
SET profile = '{
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

-- Check inserted profiles
SELECT
  full_name,
  company_name,
  user_type,
  subscription_tier,
  email
FROM profiles
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY created_at;

-- Check investor preferences
SELECT
  full_name,
  company_name,
  profile->>'bio' AS bio,
  profile->'domains' AS domains,
  (profile->>'min_cvs_threshold')::int AS min_cvs,
  profile->>'stage_preference' AS stage
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
-- 1. 10 investor profiles created
-- 2. All profiles have detailed JSONB preferences
-- 3. Can query by domain using JSONB operators
-- 4. Ready for Step 3 (Investor Dashboard)
