-- Activity Log Queries
-- Purpose: Check activity logs for CVS analysis workflow tracking

-- ============================================
-- 1. Get activity log entries by workflow_id
-- ============================================
SELECT * FROM public.activity_log
WHERE workflow_id = '2448'
ORDER BY created_at DESC;

-- ============================================
-- 2. Get activity log entries by analysis_id
-- ============================================
SELECT * FROM public.activity_log
WHERE analysis_id = 'your-analysis-uuid-here'
ORDER BY created_at ASC;

-- ============================================
-- 3. Get all workflow activity for a specific analysis
-- (Shows complete progression: Orchestrator → Discovery → Technical → Market → Competitive → IP)
-- ============================================
SELECT
  workflow_name,
  action,
  notes,
  user_email,
  domain,
  inferred_domain,
  created_at,
  user_id
FROM public.activity_log
WHERE analysis_id = 'your-analysis-uuid-here'
ORDER BY created_at ASC;

-- ============================================
-- 4. Count activities per workflow for an analysis
-- ============================================
SELECT
  workflow_name,
  COUNT(*) as activity_count
FROM public.activity_log
WHERE analysis_id = 'your-analysis-uuid-here'
GROUP BY workflow_name
ORDER BY MIN(created_at);

-- ============================================
-- 5. Get latest activity log entries (most recent first)
-- ============================================
SELECT * FROM public.activity_log
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 6. Check if analysis_id, user_email, domain, and inferred_domain columns exist and their types
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_log'
AND column_name IN ('workflow_id', 'analysis_id', 'user_id', 'user_email', 'domain', 'inferred_domain')
ORDER BY ordinal_position;

-- ============================================
-- 7. Get activity logs with NULL analysis_id (legacy entries)
-- ============================================
SELECT * FROM public.activity_log
WHERE analysis_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 8. Get activity logs for a specific user (by user_id)
-- ============================================
SELECT * FROM public.activity_log
WHERE user_id = 'your-user-uuid-here'
ORDER BY created_at DESC;

-- ============================================
-- 8b. Get activity logs for a specific user (by email)
-- ============================================
SELECT * FROM public.activity_log
WHERE user_email = 'user@example.com'
ORDER BY created_at DESC;

-- ============================================
-- 9. Get error count per analysis_id
-- ============================================
SELECT
  al.analysis_id,
  COUNT(el.id) as error_count
FROM public.activity_log al
LEFT JOIN public.error_log el ON al.analysis_id = el.analysis_id
WHERE al.analysis_id IS NOT NULL
GROUP BY al.analysis_id;

-- ============================================
-- 10. Check workflow completion status for an analysis
-- ============================================
SELECT
  analysis_id,
  MAX(CASE WHEN workflow_name = 'Orchestrator Agent' THEN 1 ELSE 0 END) as orchestrator_ran,
  MAX(CASE WHEN workflow_name = 'Discovery Agent' THEN 1 ELSE 0 END) as discovery_ran,
  MAX(CASE WHEN workflow_name = 'Technical Validation Agent' THEN 1 ELSE 0 END) as technical_ran,
  MAX(CASE WHEN workflow_name = 'Market Analysis Agent' THEN 1 ELSE 0 END) as market_ran,
  MAX(CASE WHEN workflow_name = 'Competitive Analysis Agent' THEN 1 ELSE 0 END) as competitive_ran,
  MAX(CASE WHEN workflow_name = 'IP Analysis Agent' THEN 1 ELSE 0 END) as ip_ran
FROM public.activity_log
WHERE analysis_id = 'your-analysis-uuid-here'
GROUP BY analysis_id;

-- ============================================
-- 11. Get all activity for a specific domain
-- ============================================
SELECT
  workflow_name,
  action,
  user_email,
  notes,
  created_at
FROM public.activity_log
WHERE domain = 'Computer Science'
ORDER BY created_at DESC;

-- ============================================
-- 12. Count analyses by domain
-- ============================================
SELECT
  domain,
  COUNT(DISTINCT analysis_id) as analysis_count,
  COUNT(*) as total_activity_entries
FROM public.activity_log
WHERE domain IS NOT NULL AND analysis_id IS NOT NULL
GROUP BY domain
ORDER BY analysis_count DESC;

-- ============================================
-- 13. Get activity summary by domain and workflow
-- ============================================
SELECT
  domain,
  workflow_name,
  COUNT(DISTINCT analysis_id) as unique_analyses,
  COUNT(*) as activity_count
FROM public.activity_log
WHERE domain IS NOT NULL
GROUP BY domain, workflow_name
ORDER BY domain, workflow_name;

-- ============================================
-- 14. Compare user-selected vs AI-inferred domains
-- ============================================
SELECT
  domain as user_selected,
  inferred_domain as ai_inferred,
  COUNT(*) as count,
  CASE
    WHEN domain = inferred_domain THEN 'Match'
    ELSE 'Mismatch'
  END as match_status
FROM public.activity_log
WHERE domain IS NOT NULL AND inferred_domain IS NOT NULL
GROUP BY domain, inferred_domain
ORDER BY count DESC;

-- ============================================
-- 15. Find cases where AI-inferred domain differs from user-selected
-- ============================================
SELECT
  analysis_id,
  domain as user_selected,
  inferred_domain as ai_inferred,
  user_email,
  workflow_name,
  notes,
  created_at
FROM public.activity_log
WHERE domain IS NOT NULL
AND inferred_domain IS NOT NULL
AND domain != inferred_domain
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 16. Domain inference accuracy (match percentage)
-- ============================================
SELECT
  COUNT(CASE WHEN domain = inferred_domain THEN 1 END) as matches,
  COUNT(CASE WHEN domain != inferred_domain THEN 1 END) as mismatches,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(CASE WHEN domain = inferred_domain THEN 1 END) / COUNT(*), 2) as match_percentage
FROM public.activity_log
WHERE domain IS NOT NULL AND inferred_domain IS NOT NULL;
