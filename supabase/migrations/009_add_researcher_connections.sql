-- =====================================================
-- ADD RESEARCHER CONNECTIONS TABLE
-- =====================================================
-- Purpose: Track researcher notifications and responses
-- Required for: Smart Curator Step 5 (Researcher Notification Setup)
-- Created: December 14, 2024

-- =====================================================
-- RESEARCHER_CONNECTIONS TABLE
-- =====================================================
-- Tracks when researchers are notified about patent-based opportunities
-- and their responses (interested/maybe/not_interested)

CREATE TABLE researcher_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  researcher_email TEXT NOT NULL, -- Email of the researcher
  paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE, -- The paper they authored
  analysis_id UUID REFERENCES cvs_analyses(id) ON DELETE CASCADE, -- The CVS analysis that used their paper

  -- Notification details
  notification_sent_at TIMESTAMPTZ DEFAULT NOW(),
  response TEXT CHECK (response IN ('no_response', 'interested', 'maybe', 'not_interested')) DEFAULT 'no_response',
  responded_at TIMESTAMPTZ,

  -- Researcher metadata (from fake researcher mapping)
  researcher_name TEXT,
  researcher_affiliation TEXT,

  -- Additional tracking
  metadata JSONB DEFAULT '{}', -- Can store CVS score, TAM, domain, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_researcher_connections_researcher_email ON researcher_connections(researcher_email);
CREATE INDEX idx_researcher_connections_paper_id ON researcher_connections(paper_id);
CREATE INDEX idx_researcher_connections_analysis_id ON researcher_connections(analysis_id);
CREATE INDEX idx_researcher_connections_response ON researcher_connections(response);
CREATE INDEX idx_researcher_connections_notification_sent_at ON researcher_connections(notification_sent_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_researcher_connections_updated_at
  BEFORE UPDATE ON researcher_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER VIEW: RESEARCHER RESPONSE STATS
-- =====================================================
-- View to track researcher engagement metrics

CREATE OR REPLACE VIEW researcher_response_stats AS
SELECT
  researcher_email,
  researcher_name,
  COUNT(*) AS total_notifications,
  COUNT(*) FILTER (WHERE response = 'interested') AS interested_count,
  COUNT(*) FILTER (WHERE response = 'maybe') AS maybe_count,
  COUNT(*) FILTER (WHERE response = 'not_interested') AS not_interested_count,
  COUNT(*) FILTER (WHERE response = 'no_response') AS no_response_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE response IN ('interested', 'maybe')) / NULLIF(COUNT(*), 0),
    2
  ) AS engagement_rate_percent
FROM researcher_connections
GROUP BY researcher_email, researcher_name
ORDER BY total_notifications DESC;

-- Grant access
GRANT SELECT ON researcher_response_stats TO authenticated;

-- =====================================================
-- ANALYTICS_EVENTS TABLE (OPTIONAL)
-- =====================================================
-- Purpose: Track granular user actions for analytics dashboard
-- Complements user_dashboard_activities which is more activity-feed focused

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User context
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for anonymous events
  user_role TEXT, -- 'investor', 'startup', 'researcher', 'anonymous'

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'opportunity_viewed',
    'opportunity_saved',
    'access_requested',
    'access_approved',
    'access_denied',
    'full_report_viewed',
    'researcher_notified',
    'researcher_responded',
    'filter_applied',
    'search_performed',
    'cvs_analysis_completed'
  )),

  -- Entity references
  entity_type TEXT, -- 'opportunity', 'paper', 'analysis', 'request'
  entity_id UUID,

  -- Event metadata
  metadata JSONB DEFAULT '{}', -- Store additional context (domain, CVS score, filters, etc.)

  -- Session tracking
  session_id TEXT, -- Track user sessions

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Partitioning recommendation (for high-volume production):
-- Consider partitioning this table by created_at (monthly partitions)
-- to improve query performance as data grows

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Daily platform metrics
CREATE OR REPLACE VIEW daily_platform_metrics AS
SELECT
  DATE(created_at) AS date,
  COUNT(*) FILTER (WHERE event_type = 'opportunity_viewed') AS opportunities_viewed,
  COUNT(*) FILTER (WHERE event_type = 'opportunity_saved') AS opportunities_saved,
  COUNT(*) FILTER (WHERE event_type = 'access_requested') AS access_requests,
  COUNT(*) FILTER (WHERE event_type = 'access_approved') AS access_approvals,
  COUNT(*) FILTER (WHERE event_type = 'full_report_viewed') AS full_reports_viewed,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(DISTINCT session_id) AS sessions
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Investor engagement funnel
CREATE OR REPLACE VIEW investor_engagement_funnel AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE event_type = 'opportunity_viewed') AS opportunities_viewed,
  COUNT(*) FILTER (WHERE event_type = 'opportunity_saved') AS opportunities_saved,
  COUNT(*) FILTER (WHERE event_type = 'access_requested') AS access_requests,
  COUNT(*) FILTER (WHERE event_type = 'full_report_viewed') AS full_reports_accessed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_type = 'access_requested') /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'opportunity_viewed'), 0),
    2
  ) AS view_to_request_conversion_rate
FROM analytics_events
WHERE user_role = 'investor'
GROUP BY user_id
ORDER BY opportunities_viewed DESC;

-- Grant access
GRANT SELECT ON daily_platform_metrics TO authenticated;
GRANT SELECT ON investor_engagement_funnel TO authenticated;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tables added: 2
-- 1. researcher_connections - Track researcher notifications and responses (REQUIRED for Step 5)
-- 2. analytics_events - Granular event tracking for analytics dashboard (OPTIONAL for Step 6)
--
-- Views added: 3
-- 1. researcher_response_stats - Researcher engagement metrics
-- 2. daily_platform_metrics - Daily platform KPIs
-- 3. investor_engagement_funnel - Investor conversion metrics
--
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables created successfully
-- 3. Enable RLS policies if needed (for production)
-- 4. Update TypeScript types: supabase gen types typescript
