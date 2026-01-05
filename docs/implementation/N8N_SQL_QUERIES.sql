-- =====================================================
-- N8N → SUPABASE SQL QUERIES
-- =====================================================
-- Purpose: Verify n8n integration is working correctly
-- Run these in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist
SELECT
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('research_papers', 'cvs_analyses', 'profiles')
ORDER BY tablename;
-- Expected: 3 rows


-- Quick health check - count rows
SELECT
  (SELECT COUNT(*) FROM research_papers) as total_papers,
  (SELECT COUNT(*) FROM cvs_analyses) as total_analyses,
  (SELECT COUNT(*) FROM profiles) as total_users;


-- =====================================================
-- 2. VIEW RECENT DATA
-- =====================================================

-- View most recent research paper
SELECT
  id,
  title,
  authors,
  stage,
  citation_count,
  tech_category,
  industry,
  is_published_to_marketplace,
  created_at
FROM research_papers
ORDER BY created_at DESC
LIMIT 1;


-- View most recent CVS analysis
SELECT
  id,
  title,
  query,
  cvs_score,
  technical_score,
  market_score,
  competitive_score,
  ip_score,
  tam,
  trl,
  target_industry,
  paper_id,
  analyzed_by,
  uploaded_by,
  status,
  created_at
FROM cvs_analyses
ORDER BY created_at DESC
LIMIT 1;


-- =====================================================
-- 3. VERIFY LINKAGES
-- =====================================================

-- Check paper → analysis linkage
SELECT
  p.id as paper_id,
  p.title as paper_title,
  p.stage,
  c.id as analysis_id,
  c.cvs_score,
  c.tam,
  c.trl,
  c.paper_id = p.id as "correctly_linked"
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
ORDER BY c.created_at DESC
LIMIT 5;


-- Check analysis → user linkage
SELECT
  c.id as analysis_id,
  c.title as analysis_title,
  c.cvs_score,
  prof.id as user_id,
  prof.email as analyst_email,
  prof.full_name,
  prof.user_type,
  c.analyzed_by = prof.id as "correctly_linked"
FROM cvs_analyses c
JOIN profiles prof ON c.analyzed_by = prof.id
ORDER BY c.created_at DESC
LIMIT 5;


-- Full join: papers → analyses → users
SELECT
  p.title as paper_title,
  p.stage,
  p.citation_count,
  c.cvs_score,
  c.tam,
  c.trl,
  c.target_industry,
  prof.email as analyzed_by_email,
  prof.full_name as analyst_name,
  c.created_at
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
JOIN profiles prof ON c.analyzed_by = prof.id
ORDER BY c.created_at DESC
LIMIT 10;


-- =====================================================
-- 4. DATA QUALITY CHECKS
-- =====================================================

-- Check for null CVS scores (should be 0)
SELECT COUNT(*) as null_cvs_scores
FROM cvs_analyses
WHERE cvs_score IS NULL;
-- Expected: 0


-- Check for orphaned analyses (missing paper_id)
SELECT COUNT(*) as orphaned_analyses
FROM cvs_analyses c
LEFT JOIN research_papers p ON c.paper_id = p.id
WHERE p.id IS NULL;
-- Expected: 0


-- Check for analyses without users
SELECT COUNT(*) as analyses_without_users
FROM cvs_analyses
WHERE analyzed_by IS NULL OR uploaded_by IS NULL;
-- Expected: 0


-- Check CVS score range (should be 0-100)
SELECT
  MIN(cvs_score) as min_score,
  MAX(cvs_score) as max_score,
  AVG(cvs_score) as avg_score,
  COUNT(*) as total_analyses
FROM cvs_analyses;
-- Expected: min >= 0, max <= 100


-- Check TRL range (should be 1-9)
SELECT
  MIN(trl) as min_trl,
  MAX(trl) as max_trl,
  COUNT(*) as total_with_trl
FROM cvs_analyses
WHERE trl IS NOT NULL;
-- Expected: min >= 1, max <= 9


-- =====================================================
-- 5. ANALYTICS QUERIES
-- =====================================================

-- CVS score distribution
SELECT
  CASE
    WHEN cvs_score >= 80 THEN 'Excellent (80-100)'
    WHEN cvs_score >= 60 THEN 'Good (60-79)'
    WHEN cvs_score >= 40 THEN 'Moderate (40-59)'
    ELSE 'Low (0-39)'
  END as score_range,
  COUNT(*) as count,
  ROUND(AVG(cvs_score), 2) as avg_score
FROM cvs_analyses
GROUP BY
  CASE
    WHEN cvs_score >= 80 THEN 'Excellent (80-100)'
    WHEN cvs_score >= 60 THEN 'Good (60-79)'
    WHEN cvs_score >= 40 THEN 'Moderate (40-59)'
    ELSE 'Low (0-39)'
  END
ORDER BY avg_score DESC;


-- Stage distribution
SELECT
  stage,
  COUNT(*) as count
FROM research_papers
GROUP BY stage
ORDER BY count DESC;


-- Industry distribution
SELECT
  target_industry,
  COUNT(*) as count,
  ROUND(AVG(cvs_score), 2) as avg_cvs_score
FROM cvs_analyses
WHERE target_industry IS NOT NULL
GROUP BY target_industry
ORDER BY count DESC
LIMIT 10;


-- TAM distribution
SELECT
  CASE
    WHEN tam >= 10 THEN 'Large (10B+)'
    WHEN tam >= 1 THEN 'Medium (1-10B)'
    WHEN tam >= 0.1 THEN 'Small (100M-1B)'
    ELSE 'Niche (<100M)'
  END as tam_range,
  COUNT(*) as count,
  ROUND(AVG(cvs_score), 2) as avg_cvs_score
FROM cvs_analyses
WHERE tam IS NOT NULL AND tam > 0
GROUP BY
  CASE
    WHEN tam >= 10 THEN 'Large (10B+)'
    WHEN tam >= 1 THEN 'Medium (1-10B)'
    WHEN tam >= 0.1 THEN 'Small (100M-1B)'
    ELSE 'Niche (<100M)'
  END
ORDER BY avg_cvs_score DESC;


-- =====================================================
-- 6. MARKETPLACE-READY QUERIES
-- =====================================================

-- Get top opportunities for marketplace
SELECT
  c.id as analysis_id,
  p.title as paper_title,
  p.authors,
  p.abstract,
  p.stage,
  p.citation_count,
  c.cvs_score,
  c.tam,
  c.trl,
  c.target_industry,
  c.summary,
  c.key_strengths,
  c.key_risks,
  prof.email as analyzed_by_email,
  prof.full_name as analyst_name,
  c.created_at
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
LEFT JOIN profiles prof ON c.analyzed_by = prof.id
WHERE c.status = 'completed'
  AND p.is_published_to_marketplace = true
ORDER BY c.cvs_score DESC
LIMIT 20;


-- Get opportunities by industry
SELECT
  c.target_industry,
  COUNT(*) as opportunity_count,
  ROUND(AVG(c.cvs_score), 2) as avg_cvs_score,
  ROUND(AVG(c.tam), 2) as avg_tam
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
WHERE c.status = 'completed'
  AND p.is_published_to_marketplace = true
  AND c.target_industry IS NOT NULL
GROUP BY c.target_industry
ORDER BY opportunity_count DESC;


-- Get opportunities by stage
SELECT
  p.stage,
  COUNT(*) as opportunity_count,
  ROUND(AVG(c.cvs_score), 2) as avg_cvs_score,
  MIN(c.cvs_score) as min_score,
  MAX(c.cvs_score) as max_score
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
WHERE c.status = 'completed'
  AND p.is_published_to_marketplace = true
GROUP BY p.stage
ORDER BY opportunity_count DESC;


-- =====================================================
-- 7. ACTIVITY LOG QUERIES
-- =====================================================

-- Check recent n8n workflow activity
SELECT
  workflow_name,
  action,
  status,
  details,
  created_at
FROM activity_logs
WHERE workflow_name LIKE '%orchestrator%'
ORDER BY created_at DESC
LIMIT 10;


-- Count successful vs failed analyses
SELECT
  status,
  COUNT(*) as count
FROM activity_logs
WHERE action = 'orchestration_complete'
GROUP BY status
ORDER BY count DESC;


-- =====================================================
-- 8. DEBUGGING QUERIES
-- =====================================================

-- Find analyses with missing data
SELECT
  id,
  title,
  CASE
    WHEN cvs_score IS NULL THEN 'Missing CVS score'
    WHEN tam IS NULL OR tam = 0 THEN 'Missing TAM'
    WHEN trl IS NULL THEN 'Missing TRL'
    WHEN target_industry IS NULL THEN 'Missing industry'
    WHEN summary IS NULL OR summary = '' THEN 'Missing summary'
    ELSE 'OK'
  END as issue
FROM cvs_analyses
WHERE cvs_score IS NULL
   OR tam IS NULL
   OR tam = 0
   OR trl IS NULL
   OR target_industry IS NULL
   OR summary IS NULL
   OR summary = ''
ORDER BY created_at DESC;


-- Find papers with low citation counts
SELECT
  id,
  title,
  citation_count,
  stage,
  created_at
FROM research_papers
WHERE citation_count < 5
ORDER BY created_at DESC
LIMIT 10;


-- =====================================================
-- 9. CLEANUP QUERIES (USE WITH CAUTION!)
-- =====================================================

-- Delete test data (CAREFUL!)
-- Uncomment only if you want to delete test entries

-- DELETE FROM cvs_analyses
-- WHERE title LIKE '%test%'
--    OR query LIKE '%test%';

-- DELETE FROM research_papers
-- WHERE title LIKE '%Untitled%'
--    OR title LIKE '%test%';


-- =====================================================
-- 10. USER MANAGEMENT
-- =====================================================

-- List all investors
SELECT
  id,
  email,
  full_name,
  company_name,
  role,
  subscription_tier,
  cvs_reports_used,
  cvs_reports_limit
FROM profiles
WHERE user_type = 'investor'
ORDER BY created_at DESC;


-- Find user by email
SELECT
  id,
  email,
  full_name,
  user_type,
  company_name
FROM profiles
WHERE email LIKE '%investor_ai%';


-- Count analyses by user
SELECT
  prof.email,
  prof.full_name,
  COUNT(*) as analyses_created,
  ROUND(AVG(c.cvs_score), 2) as avg_cvs_score
FROM cvs_analyses c
JOIN profiles prof ON c.analyzed_by = prof.id
GROUP BY prof.id, prof.email, prof.full_name
ORDER BY analyses_created DESC;


-- =====================================================
-- 11. PERFORMANCE QUERIES
-- =====================================================

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('research_papers', 'cvs_analyses', 'profiles', 'activity_logs')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


-- Analyses created per day (last 7 days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as analyses_created,
  ROUND(AVG(cvs_score), 2) as avg_score
FROM cvs_analyses
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;


-- =====================================================
-- 12. EXPORT QUERIES
-- =====================================================

-- Export for CSV (copy results and save as CSV)
SELECT
  p.title as "Paper Title",
  p.stage as "Stage",
  p.citation_count as "Citations",
  c.cvs_score as "CVS Score",
  c.tam as "TAM ($B)",
  c.trl as "TRL",
  c.target_industry as "Industry",
  prof.email as "Analyzed By",
  c.created_at as "Created At"
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
LEFT JOIN profiles prof ON c.analyzed_by = prof.id
WHERE c.status = 'completed'
ORDER BY c.cvs_score DESC;


-- =====================================================
-- END OF SQL QUERIES
-- =====================================================

-- Quick Test After Implementation:
-- Run this to verify everything works:

SELECT
  'research_papers' as table_name,
  COUNT(*) as row_count
FROM research_papers
UNION ALL
SELECT
  'cvs_analyses',
  COUNT(*)
FROM cvs_analyses
UNION ALL
SELECT
  'profiles',
  COUNT(*)
FROM profiles
ORDER BY table_name;

-- Expected: At least 1 row in each table
