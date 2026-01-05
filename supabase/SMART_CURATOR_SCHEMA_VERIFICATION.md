# Smart Curator Schema Verification Report

**Date:** December 14, 2024
**Purpose:** Verify database schema alignment with Smart Curator implementation workflow requirements
**Status:** ✅ **READY** (with 1 migration to run)

---

## Executive Summary

Your database schema is **MORE comprehensive** than the Smart Curator workflow requires. You have 15 production-ready tables vs. the 5 basic tables specified in the ideation workflow.

**Action Required:**
1. Run migration `009_add_researcher_connections.sql` to add the missing `researcher_connections` table
2. Optionally enable the `analytics_events` table for granular tracking (included in same migration)

---

## Table Mapping: Smart Curator → Your Schema

### ✅ Core Requirements (All Met or Exceeded)

| Smart Curator Requirement | Your Schema | Status | Notes |
|---------------------------|-------------|---------|-------|
| **opportunities** | `cvs_analyses` + `research_papers` | ✅ **Better** | Separated concerns: papers vs analyses |
| **users** | `profiles` | ✅ **Better** | Includes subscription, avatar, company, role |
| **access_requests** | `introduction_requests` | ✅ **Exact match** | Tracks investor→startup connections |
| **researcher_connections** | ❌ Missing → ✅ **Added in 009** | ⚠️ **Run migration** | Required for Step 5 (researcher notifications) |
| **analytics_events** | `user_dashboard_activities` | ⚠️ **Partial** | Activity feed vs granular events. Added enhanced version in 009 |

---

## Schema Comparison: Ideation Workflow vs. Your Implementation

### Ideation Workflow Specified (5 tables, minimal):

```sql
-- 1. opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY,
  opportunity_id TEXT UNIQUE,
  innovator_id UUID REFERENCES users(id),
  cvs_score INTEGER,
  technical_analysis JSONB,
  market_analysis JSONB,
  competitive_analysis JSONB,
  ip_analysis JSONB,
  selected_paper JSONB,
  status TEXT DEFAULT 'published'
);

-- 2. users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT, -- 'innovator', 'investor', 'researcher'
  profile JSONB,
  domains TEXT[],
  min_cvs_threshold INTEGER
);

-- 3. access_requests
CREATE TABLE access_requests (
  id UUID PRIMARY KEY,
  opportunity_id UUID REFERENCES opportunities(id),
  investor_id UUID REFERENCES users(id),
  innovator_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  message TEXT
);

-- 4. researcher_connections (MISSING - added in 009)
CREATE TABLE researcher_connections (
  id UUID PRIMARY KEY,
  researcher_email TEXT,
  opportunity_id UUID REFERENCES opportunities(id),
  response TEXT, -- 'no_response', 'interested', 'maybe', 'not_interested'
  notification_sent_at TIMESTAMPTZ
);

-- 5. analytics_events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type TEXT,
  entity_id UUID,
  metadata JSONB
);
```

### Your Implementation (15 tables, production-ready):

**User Management:**
- `profiles` - User accounts with subscription tracking
- `subscriptions` - Stripe billing integration
- `team_members` - Team collaboration features
- `notifications` - In-app notification system

**Research & Analysis:**
- `research_papers` - Research papers + marketplace listings
- `cvs_analyses` - Commercial Viability Score analyses
- `analysis_papers` - Papers cited during CVS analyses

**Marketplace & Connections:**
- `saved_opportunities` - User bookmarks/watchlist
- `introduction_requests` - Investor-startup connection requests
- `investment_commitments` - Investment offers
- `deals` - Investment pipeline tracking
- `deal_updates` - Deal audit log

**Batch Processing:**
- `batch_analyses` - Bulk CVS analysis jobs
- `batch_results` - Individual batch results

**Activity Tracking:**
- `user_dashboard_activities` - Activity feed for dashboard

**NEW (Migration 009):**
- `researcher_connections` - Researcher notification tracking
- `analytics_events` - Granular event tracking for metrics

---

## Migration Required: 009_add_researcher_connections.sql

### What This Migration Adds

**1. researcher_connections table (REQUIRED for Step 5)**

```sql
CREATE TABLE researcher_connections (
  id UUID PRIMARY KEY,
  researcher_email TEXT NOT NULL,
  paper_id UUID REFERENCES research_papers(id),
  analysis_id UUID REFERENCES cvs_analyses(id),
  notification_sent_at TIMESTAMPTZ DEFAULT NOW(),
  response TEXT CHECK (response IN ('no_response', 'interested', 'maybe', 'not_interested')),
  responded_at TIMESTAMPTZ,
  researcher_name TEXT,
  researcher_affiliation TEXT,
  metadata JSONB DEFAULT '{}'
);
```

**Purpose:** Track when researchers are notified about patent-based opportunities and their responses.

**Used in:**
- Step 5: Researcher Notification Setup
- n8n workflow: Patent detection → researcher email → response tracking

---

**2. analytics_events table (OPTIONAL for Step 6)**

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  event_type TEXT CHECK (event_type IN (
    'opportunity_viewed', 'opportunity_saved', 'access_requested',
    'access_approved', 'access_denied', 'full_report_viewed',
    'researcher_notified', 'researcher_responded', 'filter_applied',
    'search_performed', 'cvs_analysis_completed'
  )),
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Granular event tracking for analytics dashboard (Step 6).

**Used in:**
- Step 6: Demo Preparation (Analytics Dashboard)
- Track: opportunity views, access requests, researcher engagement, investor conversion funnel

---

**3. Helper Views (3 total)**

**researcher_response_stats:**
```sql
-- Tracks researcher engagement metrics
SELECT researcher_email, total_notifications, interested_count, engagement_rate_percent
FROM researcher_response_stats;
```

**daily_platform_metrics:**
```sql
-- Daily KPIs: opportunities viewed, access requests, approvals, active users
SELECT date, opportunities_viewed, access_requests, access_approvals, active_users
FROM daily_platform_metrics;
```

**investor_engagement_funnel:**
```sql
-- Investor conversion metrics: view → save → request → access
SELECT user_id, opportunities_viewed, access_requests, view_to_request_conversion_rate
FROM investor_engagement_funnel;
```

---

## How to Run the Migration

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/vqgwzzzjlswyagncyhih
   - Navigate to: SQL Editor

2. **Copy Migration File:**
   - Open: `supabase/migrations/009_add_researcher_connections.sql`
   - Copy entire file contents

3. **Execute:**
   - Paste into SQL Editor
   - Click "Run"
   - Verify success: "Success. No rows returned"

4. **Verify Tables Created:**
   ```sql
   -- Check researcher_connections
   SELECT * FROM researcher_connections LIMIT 1;

   -- Check analytics_events
   SELECT * FROM analytics_events LIMIT 1;

   -- Check views
   SELECT * FROM researcher_response_stats LIMIT 1;
   SELECT * FROM daily_platform_metrics LIMIT 1;
   SELECT * FROM investor_engagement_funnel LIMIT 1;
   ```

### Option 2: Supabase CLI (if using local development)

```bash
# Apply migration
supabase db push

# Or apply specific migration
supabase migration up --version 009
```

---

## Smart Curator Step-by-Step Requirements

### ✅ Step 1: Database Schema & Integration

**Required Tables:**
- ✅ `cvs_analyses` (your equivalent of `opportunities`)
- ✅ `research_papers` (stores selected paper details)
- ✅ `profiles` (your equivalent of `users`)
- ⚠️ `researcher_connections` (added in migration 009)
- ⚠️ `analytics_events` (added in migration 009)

**Required n8n Integration:**
- [ ] Modified orchestrator to POST CVS results to Supabase
- [ ] At least 5 test opportunities in database

**Action:** Verify n8n is POSTing to `cvs_analyses` table (not just email)

---

### ✅ Step 2: Fake Data Generation

**Required Data:**
- [ ] 5-10 fake investor profiles in `profiles` table
- [ ] 3-5 fake researcher email mappings
- [ ] SQL seed scripts

**Action:** Create fake data using your existing `profiles` table

---

### ✅ Step 3: Investor Dashboard Build

**Required Tables:**
- ✅ `cvs_analyses` (opportunity data)
- ✅ `research_papers` (paper details)
- ✅ `profiles` (investor profiles)
- ✅ `saved_opportunities` (watchlist feature)

**Optional:**
- ✅ `introduction_requests` (for "Request Access" button)

**Action:** Your schema supports this step fully

---

### ✅ Step 4: Connection Flow Implementation

**Required Tables:**
- ✅ `introduction_requests` (access request tracking)
- ✅ `cvs_analyses` (full report data)
- ✅ `profiles` (investor + innovator profiles)

**Action:** Your schema supports this step fully

---

### ⚠️ Step 5: Researcher Notification Setup

**Required Tables:**
- ⚠️ `researcher_connections` (ADDED IN MIGRATION 009)
- ✅ `cvs_analyses` (to check for patents)
- ✅ `research_papers` (selected paper details)

**Action:** Run migration 009, then proceed with Step 5

---

### ⚠️ Step 6: Demo Preparation (Analytics)

**Required Tables:**
- ⚠️ `analytics_events` (ADDED IN MIGRATION 009)
- ✅ `user_dashboard_activities` (activity feed, already exists)

**Action:** Run migration 009 for granular analytics, or use existing `user_dashboard_activities`

---

## Verification Checklist

Before proceeding with Smart Curator implementation:

### Database Setup
- [x] 15 core tables created (`001_create_core_tables.sql`)
- [x] RLS policies enabled (`002_enable_rls.sql`)
- [ ] Migration 009 applied (`009_add_researcher_connections.sql`)
- [ ] Verify migration: `SELECT * FROM researcher_connections;`
- [ ] Verify migration: `SELECT * FROM analytics_events;`

### n8n Integration
- [ ] n8n orchestrator modified to POST to `cvs_analyses` table
- [ ] Test POST successful (check Supabase Table Editor)
- [ ] At least 5 test analyses in `cvs_analyses` table
- [ ] `research_papers` table has corresponding entries

### Fake Data
- [ ] 5-10 fake investor profiles in `profiles` table (role='investor')
- [ ] 3-5 fake researcher emails mapped (JSON file or n8n function)
- [ ] Test data loaded successfully

### Environment Variables
- [ ] `.env.local` has Supabase URL
- [ ] `.env.local` has Supabase anon key
- [ ] `.env.local` has Supabase service role key (for server-side operations)

---

## Key Differences: Your Schema vs. Ideation Spec

### Advantages of Your Schema

**1. Separated Concerns:**
- Ideation: Single `opportunities` table mixing paper + analysis
- Yours: `research_papers` (source material) + `cvs_analyses` (analysis results)
- **Benefit:** Cleaner data model, one paper → many analyses

**2. Investment Pipeline:**
- Ideation: Basic `access_requests` only
- Yours: Full pipeline with `introduction_requests` → `investment_commitments` → `deals` → `deal_updates`
- **Benefit:** Can track full investor journey, not just initial connection

**3. Subscription & Billing:**
- Ideation: No subscription model
- Yours: `profiles.subscription_tier` + `subscriptions` table with Stripe integration
- **Benefit:** Ready for monetization (Phase 3+)

**4. Collaboration Features:**
- Ideation: Single-user only
- Yours: `team_members` table for multi-user accounts
- **Benefit:** Supports corporate R&D users (enterprise tier)

### Areas to Adapt

**1. Opportunity Listing:**
- Your schema separates `research_papers` and `cvs_analyses`
- Smart Curator expects combined view
- **Solution:** Create a view or JOIN both tables in API queries

**2. Researcher Tracking:**
- Your schema was missing `researcher_connections`
- **Solution:** ✅ Added in migration 009

**3. Analytics Granularity:**
- Your `user_dashboard_activities` is activity-feed focused
- Smart Curator needs event-level tracking
- **Solution:** ✅ Added `analytics_events` in migration 009

---

## Recommended Next Steps

### Immediate (Before Starting Step 1)
1. ✅ Run migration `009_add_researcher_connections.sql`
2. ✅ Verify tables created: `researcher_connections`, `analytics_events`
3. ✅ Test INSERT into new tables
4. ✅ Verify views work: `researcher_response_stats`, `daily_platform_metrics`

### Step 1: Database Schema & Integration
1. ✅ Your schema already exceeds requirements
2. ⚠️ Modify n8n orchestrator to POST to `cvs_analyses` table
3. ⚠️ Ensure `research_papers` table is populated with selected paper
4. ⚠️ Test end-to-end: n8n → Supabase → verify data

### Step 2: Fake Data Generation
1. Create 5-10 fake investor profiles in `profiles` table
   - Set `user_type='investor'`
   - Populate `profile` JSONB with realistic data
   - Add domains array (e.g., `['AI/ML', 'Healthcare']`)
2. Create researcher email mapping JSON
3. Link researchers to papers in `research_papers` table

### Step 3+: Implementation
- Your schema is ready for Steps 3-6
- No additional database changes needed
- Focus on frontend + n8n integration

---

## Database ER Diagram

You already have an ER diagram at:
- **DBML:** `supabase/DATABASE_SCHEMA.dbml`
- **PNG:** `supabase/ER_diagrams/R2M_ER_diagram.png`
- **SVG:** `supabase/ER_diagrams/R2M_ER_diagram.svg`
- **SQL:** `supabase/ER_diagrams/R2M_ER_diagram_postgres.sql`

**Recommendation:** Update ER diagram to include `researcher_connections` and `analytics_events` after running migration 009.

---

## Conclusion

**Status:** ✅ **READY FOR SMART CURATOR IMPLEMENTATION**

**Action Required:**
1. Run migration `009_add_researcher_connections.sql` (5 minutes)
2. Verify tables created successfully (2 minutes)
3. Proceed to Smart Curator Step 1: Database Schema & Integration

**Your Schema Grade:** **A+**
- You have a production-ready schema with 15 tables
- Smart Curator only needed 5 basic tables
- You're ready for Phase 2 MVP AND Phase 3/4 features

**Confidence Level:** **HIGH**
- All core requirements met or exceeded
- Only 1 missing table (now added)
- n8n integration is the only remaining Step 1 task

---

**Next:** Run `009_add_researcher_connections.sql`, then ask me to help with Step 1 (n8n integration) or Step 2 (fake data generation).
