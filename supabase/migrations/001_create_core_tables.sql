-- R2M Marketplace Database Schema
-- Created: December 12, 2024
-- Purpose: Complete database schema with meaningful table names

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Stores user profile information (extends auth.users)

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('startup', 'investor', 'corporate_rd', 'tto', 'innovation_hub', 'researcher')) NOT NULL,
  company_name TEXT,
  role TEXT,
  avatar_url TEXT,

  -- Subscription tracking
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'pro', 'growth', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  cvs_reports_used INTEGER DEFAULT 0,
  cvs_reports_limit INTEGER DEFAULT 3, -- Free tier gets 3 per month
  subscription_renews_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 2. RESEARCH_PAPERS TABLE
-- =====================================================
-- Stores research papers (uploaded or from external sources)

CREATE TABLE research_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Paper metadata
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  publication_date DATE,
  citation_count INTEGER DEFAULT 0,
  doi TEXT,

  -- File storage
  pdf_url TEXT, -- Supabase Storage URL

  -- External source tracking
  external_id TEXT, -- arXiv ID, Semantic Scholar ID, etc.
  source TEXT CHECK (source IN ('user_upload', 'arxiv', 'semantic_scholar', 'pubmed')),

  -- Marketplace status
  is_published_to_marketplace BOOLEAN DEFAULT FALSE,
  marketplace_description TEXT, -- Custom description for marketplace listing
  tech_category TEXT, -- e.g., "AI/ML", "Biotech", "Materials"
  industry TEXT, -- e.g., "Healthcare", "Energy", "Manufacturing"
  stage TEXT, -- e.g., "Concept", "Prototype", "Pilot", "Market-Ready"
  funding_goal NUMERIC,
  view_count INTEGER DEFAULT 0,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_research_papers_uploaded_by ON research_papers(uploaded_by);
CREATE INDEX idx_research_papers_source ON research_papers(source);
CREATE INDEX idx_research_papers_marketplace ON research_papers(is_published_to_marketplace);
CREATE INDEX idx_research_papers_title_search ON research_papers USING gin(to_tsvector('english', title));
CREATE INDEX idx_research_papers_abstract_search ON research_papers USING gin(to_tsvector('english', abstract));

-- Triggers
CREATE TRIGGER update_research_papers_updated_at
  BEFORE UPDATE ON research_papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CVS_ANALYSES TABLE
-- =====================================================
-- Stores Commercial Viability Score analyses

CREATE TABLE cvs_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE,
  analyzed_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Analysis input
  title TEXT NOT NULL,
  query TEXT NOT NULL, -- Original search query or analysis prompt

  -- Overall CVS Score (0-100)
  cvs_score INTEGER CHECK (cvs_score >= 0 AND cvs_score <= 100),

  -- Dimension Scores
  technical_score INTEGER CHECK (technical_score >= 0 AND technical_score <= 25),
  market_score INTEGER CHECK (market_score >= 0 AND market_score <= 25),
  commercial_score INTEGER CHECK (commercial_score >= 0 AND commercial_score <= 20),
  competitive_score INTEGER CHECK (competitive_score >= 0 AND competitive_score <= 15),
  ip_score INTEGER CHECK (ip_score >= 0 AND ip_score <= 10),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 5),

  -- Market analysis
  tam NUMERIC, -- Total Addressable Market
  trl INTEGER CHECK (trl >= 1 AND trl <= 9), -- Technology Readiness Level
  target_industry TEXT,

  -- Analysis outputs
  summary TEXT,
  recommendations TEXT,
  key_strengths TEXT[],
  key_risks TEXT[],
  go_to_market_strategy TEXT,

  -- Status tracking
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  is_ai_generated BOOLEAN DEFAULT FALSE,

  -- Additional data
  analysis_notes JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cvs_analyses_paper_id ON cvs_analyses(paper_id);
CREATE INDEX idx_cvs_analyses_analyzed_by ON cvs_analyses(analyzed_by);
CREATE INDEX idx_cvs_analyses_status ON cvs_analyses(status);
CREATE INDEX idx_cvs_analyses_cvs_score ON cvs_analyses(cvs_score DESC);

-- Triggers
CREATE TRIGGER update_cvs_analyses_updated_at
  BEFORE UPDATE ON cvs_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ANALYSIS_PAPERS TABLE
-- =====================================================
-- Stores papers found/cited during CVS analysis

CREATE TABLE analysis_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES cvs_analyses(id) ON DELETE CASCADE NOT NULL,

  -- Paper details
  title TEXT NOT NULL,
  authors TEXT[],
  abstract TEXT,
  publication_date DATE,
  citation_count INTEGER,
  url TEXT,

  -- Relevance scoring
  relevance_score NUMERIC,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analysis_papers_analysis_id ON analysis_papers(analysis_id);
CREATE INDEX idx_analysis_papers_relevance ON analysis_papers(relevance_score DESC);

-- =====================================================
-- 5. SAVED_OPPORTUNITIES TABLE
-- =====================================================
-- Stores saved/bookmarked research papers for users

CREATE TABLE saved_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, paper_id)
);

-- Indexes
CREATE INDEX idx_saved_opportunities_user_id ON saved_opportunities(user_id);
CREATE INDEX idx_saved_opportunities_paper_id ON saved_opportunities(paper_id);

-- =====================================================
-- 6. INTRODUCTION_REQUESTS TABLE
-- =====================================================
-- Tracks connection requests between investors and startups

CREATE TABLE introduction_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  startup_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_introduction_requests_paper_id ON introduction_requests(paper_id);
CREATE INDEX idx_introduction_requests_investor_id ON introduction_requests(investor_id);
CREATE INDEX idx_introduction_requests_startup_id ON introduction_requests(startup_id);
CREATE INDEX idx_introduction_requests_status ON introduction_requests(status);

-- Triggers
CREATE TRIGGER update_introduction_requests_updated_at
  BEFORE UPDATE ON introduction_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INVESTMENT_COMMITMENTS TABLE
-- =====================================================
-- Stores non-binding investment commitments from investors

CREATE TABLE investment_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  startup_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Commitment details
  amount NUMERIC NOT NULL CHECK (amount > 0),
  investment_type TEXT NOT NULL CHECK (investment_type IN ('safe', 'convertible', 'equity', 'revenue', 'flexible')),
  timeline TEXT NOT NULL CHECK (timeline IN ('30', '60', '90', 'flexible')),
  message TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_investment_commitments_paper_id ON investment_commitments(paper_id);
CREATE INDEX idx_investment_commitments_investor_id ON investment_commitments(investor_id);
CREATE INDEX idx_investment_commitments_startup_id ON investment_commitments(startup_id);
CREATE INDEX idx_investment_commitments_status ON investment_commitments(status);

-- Triggers
CREATE TRIGGER update_investment_commitments_updated_at
  BEFORE UPDATE ON investment_commitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. DEALS TABLE
-- =====================================================
-- Tracks accepted investment commitments through the pipeline

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference to commitment
  commitment_id UUID REFERENCES investment_commitments(id) ON DELETE CASCADE NOT NULL,

  -- Deal status
  status TEXT NOT NULL DEFAULT 'committed' CHECK (status IN ('committed', 'due_diligence', 'term_sheet', 'closing', 'closed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Timeline
  start_date DATE DEFAULT CURRENT_DATE,
  expected_close_date DATE,
  actual_close_date DATE,

  -- Milestones tracking
  milestones JSONB DEFAULT '{
    "commitment": {"completed": true, "date": null},
    "due_diligence": {"completed": false, "date": null},
    "term_sheet": {"completed": false, "date": null},
    "closing": {"completed": false, "date": null}
  }'::jsonb,

  -- Documents tracking
  documents JSONB DEFAULT '[
    {"name": "NDA.pdf", "uploaded": false, "url": null},
    {"name": "Financial Statements.xlsx", "uploaded": false, "url": null},
    {"name": "IP Portfolio.pdf", "uploaded": false, "url": null},
    {"name": "Term Sheet.docx", "uploaded": false, "url": null}
  ]'::jsonb,

  -- Notes and history
  notes TEXT,
  update_history JSONB DEFAULT '[]'::jsonb,

  -- Success fee tracking (2-5% platform fee on closed deals)
  success_fee_paid BOOLEAN DEFAULT FALSE,
  success_fee_amount NUMERIC,
  success_fee_invoice_id TEXT, -- Stripe invoice ID
  success_fee_paid_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deals_commitment_id ON deals(commitment_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX idx_deals_success_fee_paid ON deals(success_fee_paid);

-- Triggers
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DEAL_UPDATES TABLE
-- =====================================================
-- Audit log of all deal status changes and communications

CREATE TABLE deal_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Update details
  old_status TEXT,
  new_status TEXT,
  note TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deal_updates_deal_id ON deal_updates(deal_id);
CREATE INDEX idx_deal_updates_created_at ON deal_updates(created_at DESC);

-- =====================================================
-- 10. BATCH_ANALYSES TABLE
-- =====================================================
-- Tracks bulk CVS analysis jobs (for Corporate R&D users)

CREATE TABLE batch_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Batch details
  batch_name TEXT NOT NULL,
  total_queries INTEGER NOT NULL,
  completed_count INTEGER DEFAULT 0,

  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_batch_analyses_user_id ON batch_analyses(user_id);
CREATE INDEX idx_batch_analyses_status ON batch_analyses(status);

-- Triggers
CREATE TRIGGER update_batch_analyses_updated_at
  BEFORE UPDATE ON batch_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. BATCH_RESULTS TABLE
-- =====================================================
-- Individual analysis results within a batch job

CREATE TABLE batch_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batch_analyses(id) ON DELETE CASCADE NOT NULL,

  -- Query details
  query TEXT NOT NULL,
  cvs_score INTEGER,

  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  result_summary TEXT,

  -- Link to full analysis (if created)
  analysis_id UUID REFERENCES cvs_analyses(id) ON DELETE SET NULL,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_batch_results_batch_id ON batch_results(batch_id);
CREATE INDEX idx_batch_results_status ON batch_results(status);

-- =====================================================
-- 12. TEAM_MEMBERS TABLE
-- =====================================================
-- Collaboration features for team accounts

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_email TEXT NOT NULL,

  -- Access control
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  permissions TEXT[] DEFAULT '{}',

  -- Status
  status TEXT CHECK (status IN ('invited', 'active', 'inactive')) DEFAULT 'invited',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_members_owner_id ON team_members(owner_id);
CREATE INDEX idx_team_members_member_email ON team_members(member_email);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Triggers
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. USER_DASHBOARD_ACTIVITIES TABLE
-- =====================================================
-- Activity feed for user dashboard

CREATE TABLE user_dashboard_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'cvs_analysis_completed',
    'paper_uploaded',
    'paper_published_to_marketplace',
    'investor_interest',
    'introduction_request',
    'commitment_received',
    'deal_status_changed',
    'team_member_added'
  )),
  entity_type TEXT, -- 'paper', 'analysis', 'deal', etc.
  entity_id UUID,
  description TEXT,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_dashboard_activities_user_id ON user_dashboard_activities(user_id);
CREATE INDEX idx_user_dashboard_activities_activity_type ON user_dashboard_activities(activity_type);
CREATE INDEX idx_user_dashboard_activities_created_at ON user_dashboard_activities(created_at DESC);

-- =====================================================
-- 14. SUBSCRIPTIONS TABLE
-- =====================================================
-- Stripe subscription tracking

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Stripe details
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Subscription details
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'pro', 'growth', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 15. NOTIFICATIONS TABLE
-- =====================================================
-- In-app notifications for users

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Notification details
  type TEXT NOT NULL CHECK (type IN (
    'cvs_analysis_ready',
    'investor_interest',
    'introduction_request',
    'commitment_received',
    'deal_update',
    'subscription_update',
    'system_announcement'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to relevant page

  -- Status
  is_read BOOLEAN DEFAULT FALSE,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- AUTOMATED FUNCTIONS
-- =====================================================

-- Function to create deal when commitment is accepted
CREATE OR REPLACE FUNCTION create_deal_on_commitment_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO deals (
      commitment_id,
      status,
      progress,
      expected_close_date,
      milestones
    )
    VALUES (
      NEW.id,
      'committed',
      15,
      CASE
        WHEN NEW.timeline = '30' THEN CURRENT_DATE + INTERVAL '30 days'
        WHEN NEW.timeline = '60' THEN CURRENT_DATE + INTERVAL '60 days'
        WHEN NEW.timeline = '90' THEN CURRENT_DATE + INTERVAL '90 days'
        ELSE CURRENT_DATE + INTERVAL '90 days'
      END,
      jsonb_set(
        '{
          "commitment": {"completed": false, "date": null},
          "due_diligence": {"completed": false, "date": null},
          "term_sheet": {"completed": false, "date": null},
          "closing": {"completed": false, "date": null}
        }'::jsonb,
        '{commitment,completed}',
        'true'::jsonb
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_deal_on_commitment_acceptance
  AFTER UPDATE ON investment_commitments
  FOR EACH ROW
  EXECUTE FUNCTION create_deal_on_commitment_acceptance();

-- Function to update deal progress based on status
CREATE OR REPLACE FUNCTION update_deal_progress_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update progress percentage
  NEW.progress := CASE NEW.status
    WHEN 'committed' THEN 15
    WHEN 'due_diligence' THEN 40
    WHEN 'term_sheet' THEN 70
    WHEN 'closing' THEN 90
    WHEN 'closed' THEN 100
    WHEN 'failed' THEN NEW.progress
    ELSE NEW.progress
  END;

  -- Update milestones
  IF NEW.status = 'due_diligence' AND NOT (NEW.milestones->'due_diligence'->>'completed')::boolean THEN
    NEW.milestones := jsonb_set(
      jsonb_set(NEW.milestones, '{due_diligence,completed}', 'true'::jsonb),
      '{due_diligence,date}',
      to_jsonb(CURRENT_DATE::text)
    );
  ELSIF NEW.status = 'term_sheet' AND NOT (NEW.milestones->'term_sheet'->>'completed')::boolean THEN
    NEW.milestones := jsonb_set(
      jsonb_set(NEW.milestones, '{term_sheet,completed}', 'true'::jsonb),
      '{term_sheet,date}',
      to_jsonb(CURRENT_DATE::text)
    );
  ELSIF NEW.status = 'closed' AND NOT (NEW.milestones->'closing'->>'completed')::boolean THEN
    NEW.milestones := jsonb_set(
      jsonb_set(NEW.milestones, '{closing,completed}', 'true'::jsonb),
      '{closing,date}',
      to_jsonb(CURRENT_DATE::text)
    );
    NEW.actual_close_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deal_progress_on_status_change
  BEFORE UPDATE ON deals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_deal_progress_on_status_change();

-- Function to log deal updates
CREATE OR REPLACE FUNCTION log_deal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Create audit log entry
    INSERT INTO deal_updates (deal_id, user_id, old_status, new_status, note)
    VALUES (NEW.id, auth.uid(), OLD.status, NEW.status, NEW.notes);

    -- Append to JSONB history
    NEW.update_history := NEW.update_history || jsonb_build_object(
      'timestamp', NOW(),
      'old_status', OLD.status,
      'new_status', NEW.status,
      'user_id', auth.uid(),
      'note', NEW.notes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_deal_status_change
  BEFORE UPDATE ON deals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_deal_status_change();

-- =====================================================
-- VIEWS
-- =====================================================

-- Comprehensive deal pipeline view
CREATE OR REPLACE VIEW deal_pipeline AS
SELECT
  d.id AS deal_id,
  d.status,
  d.progress,
  d.start_date,
  d.expected_close_date,
  d.actual_close_date,
  d.milestones,
  d.documents,
  d.notes,
  d.success_fee_paid,
  d.success_fee_amount,
  d.created_at AS deal_created_at,

  -- Commitment details
  ic.id AS commitment_id,
  ic.amount AS investment_amount,
  ic.investment_type,
  ic.timeline,
  ic.message AS investor_message,

  -- Investor details
  investor.id AS investor_id,
  investor.full_name AS investor_name,
  investor.email AS investor_email,
  investor.company_name AS investor_company,

  -- Research paper details
  rp.id AS paper_id,
  rp.title AS paper_title,
  rp.authors AS paper_authors,

  -- Startup details
  startup.id AS startup_id,
  startup.full_name AS startup_name,
  startup.email AS startup_email,
  startup.company_name AS startup_company

FROM deals d
JOIN investment_commitments ic ON d.commitment_id = ic.id
JOIN profiles investor ON ic.investor_id = investor.id
JOIN research_papers rp ON ic.paper_id = rp.id
JOIN profiles startup ON ic.startup_id = startup.id;

-- Marketplace view (public research papers with CVS scores)
CREATE OR REPLACE VIEW marketplace_opportunities AS
SELECT
  rp.id AS paper_id,
  rp.title,
  rp.authors,
  rp.abstract,
  rp.tech_category,
  rp.industry,
  rp.stage,
  rp.funding_goal,
  rp.view_count,
  rp.marketplace_description,
  rp.created_at,

  -- Latest CVS analysis
  cvs.id AS analysis_id,
  cvs.cvs_score,
  cvs.technical_score,
  cvs.market_score,
  cvs.tam,
  cvs.trl,
  cvs.summary,

  -- Startup details
  p.id AS startup_id,
  p.full_name AS startup_name,
  p.company_name AS startup_company

FROM research_papers rp
LEFT JOIN LATERAL (
  SELECT * FROM cvs_analyses
  WHERE paper_id = rp.id
  ORDER BY created_at DESC
  LIMIT 1
) cvs ON true
JOIN profiles p ON rp.uploaded_by = p.id
WHERE rp.is_published_to_marketplace = true;

-- Grant access to views
GRANT SELECT ON deal_pipeline TO authenticated;
GRANT SELECT ON marketplace_opportunities TO authenticated;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tables created: 15
-- 1. profiles - User accounts
-- 2. research_papers - Research papers (replaces listings)
-- 3. cvs_analyses - Commercial Viability Score analyses (replaces analysis)
-- 4. analysis_papers - Papers cited in CVS analyses
-- 5. saved_opportunities - Saved/bookmarked research papers
-- 6. introduction_requests - Connection requests
-- 7. investment_commitments - Investment offers
-- 8. deals - Investment pipeline tracking
-- 9. deal_updates - Deal audit log
-- 10. batch_analyses - Bulk CVS analysis jobs (replaces batch_analysis)
-- 11. batch_results - Individual batch results
-- 12. team_members - Team collaboration
-- 13. user_dashboard_activities - Activity feed for user dashboard
-- 14. subscriptions - Stripe billing
-- 15. notifications - In-app notifications
--
-- Views created: 2
-- 1. deal_pipeline - Comprehensive deal tracking
-- 2. marketplace_opportunities - Public marketplace listings
--
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Enable Row Level Security (see 002_enable_rls.sql)
-- 3. Regenerate TypeScript types
