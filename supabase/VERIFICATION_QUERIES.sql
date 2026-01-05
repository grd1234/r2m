-- R2M Marketplace Database Verification Queries
-- Run these in Supabase SQL Editor after migrations

-- =====================================================
-- 1. VERIFY ALL TABLES CREATED (Should return 15 rows)
-- =====================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected Result: 15 tables
-- activities
-- analysis_papers
-- batch_analyses
-- batch_results
-- cvs_analyses
-- deal_updates
-- deals
-- introduction_requests
-- investment_commitments
-- notifications
-- profiles
-- research_papers
-- saved_opportunities
-- subscriptions
-- team_members

-- =====================================================
-- 2. VERIFY VIEWS CREATED (Should return 2 rows)
-- =====================================================

SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected Result: 2 views
-- deal_pipeline
-- marketplace_opportunities

-- =====================================================
-- 3. VERIFY RLS ENABLED (All should have rowsecurity = true)
-- =====================================================

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected Result: All 15 tables with rowsecurity = true

-- =====================================================
-- 4. VERIFY RLS POLICIES CREATED
-- =====================================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected Result: Multiple policies for each table

-- =====================================================
-- 5. VERIFY TRIGGERS CREATED
-- =====================================================

SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected Result: Triggers for updated_at, profile creation, deal automation

-- =====================================================
-- 6. VERIFY FUNCTIONS CREATED
-- =====================================================

SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Expected Result: Functions like update_updated_at_column(), handle_new_user(), etc.

-- =====================================================
-- 7. VERIFY FOREIGN KEY CONSTRAINTS
-- =====================================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected Result: Foreign keys like research_papers.uploaded_by → profiles.id

-- =====================================================
-- 8. VERIFY INDEXES CREATED
-- =====================================================

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected Result: Multiple indexes for performance (user_id, status, etc.)

-- =====================================================
-- 9. COUNT RECORDS (Should be 0 for fresh database)
-- =====================================================

SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'research_papers', COUNT(*) FROM research_papers
UNION ALL
SELECT 'cvs_analyses', COUNT(*) FROM cvs_analyses
UNION ALL
SELECT 'analysis_papers', COUNT(*) FROM analysis_papers
UNION ALL
SELECT 'saved_opportunities', COUNT(*) FROM saved_opportunities
UNION ALL
SELECT 'introduction_requests', COUNT(*) FROM introduction_requests
UNION ALL
SELECT 'investment_commitments', COUNT(*) FROM investment_commitments
UNION ALL
SELECT 'deals', COUNT(*) FROM deals
UNION ALL
SELECT 'deal_updates', COUNT(*) FROM deal_updates
UNION ALL
SELECT 'batch_analyses', COUNT(*) FROM batch_analyses
UNION ALL
SELECT 'batch_results', COUNT(*) FROM batch_results
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;

-- Expected Result: All tables with 0 records (fresh database)

-- =====================================================
-- 10. TEST CURRENT USER FUNCTION (For RLS)
-- =====================================================

SELECT auth.uid() as current_user_id;

-- Expected Result: NULL if not logged in, or user UUID if logged in

-- =====================================================
-- 11. VERIFY TABLE COLUMN DETAILS
-- =====================================================

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'research_papers'
ORDER BY ordinal_position;

-- Expected Result: All columns for research_papers table

-- =====================================================
-- 12. VERIFY UNIQUE CONSTRAINTS
-- =====================================================

SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Expected Result: Unique constraints like saved_opportunities(user_id, paper_id)

-- =====================================================
-- 13. VERIFY CHECK CONSTRAINTS
-- =====================================================

SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Expected Result: Check constraints like user_type IN ('startup', 'investor', ...)

-- =====================================================
-- 14. VERIFY VIEWS DEFINITION
-- =====================================================

SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected Result: SQL definitions for deal_pipeline and marketplace_opportunities

-- =====================================================
-- 15. SUMMARY QUERY
-- =====================================================

SELECT
  'Total Tables' as metric,
  COUNT(*)::text as value
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT
  'Total Views',
  COUNT(*)::text
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT
  'Total Functions',
  COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public'
UNION ALL
SELECT
  'Total RLS Policies',
  COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT
  'Total Triggers',
  COUNT(*)::text
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT
  'Total Indexes',
  COUNT(*)::text
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname NOT LIKE '%pkey';

-- Expected Result:
-- Total Tables: 15
-- Total Views: 2
-- Total Functions: ~5
-- Total RLS Policies: ~50+
-- Total Triggers: ~15
-- Total Indexes: ~30+

-- =====================================================
-- END OF VERIFICATION QUERIES
-- =====================================================
