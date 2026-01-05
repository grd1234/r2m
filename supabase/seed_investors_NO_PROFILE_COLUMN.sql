-- =====================================================
-- SEED FAKE INVESTORS - COMPATIBLE WITH YOUR SCHEMA
-- =====================================================
-- Purpose: Works with existing profiles table (no profile column)
-- Run migration 010 first if you want JSONB preferences

-- =====================================================
-- STEP 1: Create auth users
-- =====================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_ai_vc@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dr. Maria Chen","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_healthcare_angel@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dr. Raj Patel","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_climate_corp@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sophie Anderson","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_seed_generalist@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"James Lee","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_biotech_specialist@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dr. Emily Rodriguez","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_saas_vc@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Michael Zhang","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_impact@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Aaliyah Williams","user_type":"investor"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_corporate_rd@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"David Kim","user_type":"corporate_rd"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_tto@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Prof. Sarah Johnson","user_type":"tto"}',
   'authenticated', 'authenticated'),

  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
   'demo+investor_accelerator@infyra.ai', crypt('demo_password_123', gen_salt('bf')),
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Alex Martinez","user_type":"innovation_hub"}',
   'authenticated', 'authenticated');

-- =====================================================
-- STEP 2: Update profiles (fields that exist)
-- =====================================================

UPDATE profiles SET company_name = 'Catalyst Ventures', role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/women/44.jpg',
  subscription_tier = 'premium', cvs_reports_used = 12, cvs_reports_limit = 50
WHERE email = 'demo+investor_ai_vc@infyra.ai';

UPDATE profiles SET company_name = 'Patel Family Office', role = 'Managing Director',
  avatar_url = 'https://randomuser.me/api/portraits/men/32.jpg',
  subscription_tier = 'basic', cvs_reports_used = 3, cvs_reports_limit = 10
WHERE email = 'demo+investor_healthcare_angel@infyra.ai';

UPDATE profiles SET company_name = 'GreenTech Ventures', role = 'Principal',
  avatar_url = 'https://randomuser.me/api/portraits/women/68.jpg',
  subscription_tier = 'enterprise', cvs_reports_used = 8, cvs_reports_limit = 100
WHERE email = 'demo+investor_climate_corp@infyra.ai';

UPDATE profiles SET company_name = 'Seedstage Capital', role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/men/22.jpg',
  subscription_tier = 'premium', cvs_reports_used = 15, cvs_reports_limit = 50
WHERE email = 'demo+investor_seed_generalist@infyra.ai';

UPDATE profiles SET company_name = 'BioPharma Angels', role = 'Lead Investor',
  avatar_url = 'https://randomuser.me/api/portraits/women/50.jpg',
  subscription_tier = 'pro', cvs_reports_used = 6, cvs_reports_limit = 25
WHERE email = 'demo+investor_biotech_specialist@infyra.ai';

UPDATE profiles SET company_name = 'Index Ventures', role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/men/18.jpg',
  subscription_tier = 'premium', cvs_reports_used = 10, cvs_reports_limit = 50
WHERE email = 'demo+investor_saas_vc@infyra.ai';

UPDATE profiles SET company_name = 'Impact First Capital', role = 'Managing Partner',
  avatar_url = 'https://randomuser.me/api/portraits/women/28.jpg',
  subscription_tier = 'basic', cvs_reports_used = 4, cvs_reports_limit = 10
WHERE email = 'demo+investor_impact@infyra.ai';

UPDATE profiles SET company_name = 'Samsung Research', role = 'VP Innovation Scouting',
  avatar_url = 'https://randomuser.me/api/portraits/men/45.jpg',
  subscription_tier = 'enterprise', cvs_reports_used = 20, cvs_reports_limit = 100
WHERE email = 'demo+investor_corporate_rd@infyra.ai';

UPDATE profiles SET company_name = 'Stanford OTL', role = 'Director of Licensing',
  avatar_url = 'https://randomuser.me/api/portraits/women/72.jpg',
  subscription_tier = 'pro', cvs_reports_used = 7, cvs_reports_limit = 25
WHERE email = 'demo+investor_tto@infyra.ai';

UPDATE profiles SET company_name = 'Y Combinator', role = 'Group Partner',
  avatar_url = 'https://randomuser.me/api/portraits/men/60.jpg',
  subscription_tier = 'premium', cvs_reports_used = 18, cvs_reports_limit = 50
WHERE email = 'demo+investor_accelerator@infyra.ai';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT full_name, company_name, role, subscription_tier
FROM profiles
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY full_name;

-- Should return 10 rows
