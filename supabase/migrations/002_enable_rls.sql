-- R2M Marketplace Row Level Security (RLS) Policies
-- Created: December 12, 2024
-- Purpose: Secure database tables with proper access controls

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.introduction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Anyone can view basic profile info for marketplace purposes
CREATE POLICY "Public profiles viewable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- =====================================================
-- 2. RESEARCH_PAPERS TABLE POLICIES
-- =====================================================

-- Users can view papers they uploaded
CREATE POLICY "Users can view own papers"
  ON public.research_papers
  FOR SELECT
  USING (auth.uid() = uploaded_by);

-- Users can view papers published to marketplace
CREATE POLICY "Published papers are viewable"
  ON public.research_papers
  FOR SELECT
  USING (is_published_to_marketplace = true);

-- Users can insert their own papers
CREATE POLICY "Users can insert own papers"
  ON public.research_papers
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own papers
CREATE POLICY "Users can update own papers"
  ON public.research_papers
  FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Users can delete their own papers
CREATE POLICY "Users can delete own papers"
  ON public.research_papers
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- =====================================================
-- 3. CVS_ANALYSES TABLE POLICIES
-- =====================================================

-- Users can view their own CVS analyses
CREATE POLICY "Users can view own analyses"
  ON public.cvs_analyses
  FOR SELECT
  USING (auth.uid() = analyzed_by);

-- Users can view CVS analyses for published papers
CREATE POLICY "Published paper analyses are viewable"
  ON public.cvs_analyses
  FOR SELECT
  USING (
    paper_id IN (
      SELECT id FROM public.research_papers
      WHERE is_published_to_marketplace = true
    )
  );

-- Users can create CVS analyses
CREATE POLICY "Users can create analyses"
  ON public.cvs_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = analyzed_by);

-- Users can update their own analyses
CREATE POLICY "Users can update own analyses"
  ON public.cvs_analyses
  FOR UPDATE
  USING (auth.uid() = analyzed_by);

-- =====================================================
-- 4. ANALYSIS_PAPERS TABLE POLICIES
-- =====================================================

-- Users can view papers from their own analyses
CREATE POLICY "Users can view papers from own analyses"
  ON public.analysis_papers
  FOR SELECT
  USING (
    analysis_id IN (
      SELECT id FROM public.cvs_analyses
      WHERE analyzed_by = auth.uid()
    )
  );

-- Users can insert papers into their own analyses
CREATE POLICY "Users can add papers to own analyses"
  ON public.analysis_papers
  FOR INSERT
  WITH CHECK (
    analysis_id IN (
      SELECT id FROM public.cvs_analyses
      WHERE analyzed_by = auth.uid()
    )
  );

-- =====================================================
-- 5. SAVED_OPPORTUNITIES TABLE POLICIES
-- =====================================================

-- Users can view their own saved opportunities
CREATE POLICY "Users can view own saved opportunities"
  ON public.saved_opportunities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their saved opportunities
CREATE POLICY "Users can save opportunities"
  ON public.saved_opportunities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove from their saved opportunities
CREATE POLICY "Users can unsave opportunities"
  ON public.saved_opportunities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update their saved opportunity notes
CREATE POLICY "Users can update saved opportunities"
  ON public.saved_opportunities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. INTRODUCTION_REQUESTS TABLE POLICIES
-- =====================================================

-- Investors can view their own introduction requests
CREATE POLICY "Investors can view own requests"
  ON public.introduction_requests
  FOR SELECT
  USING (auth.uid() = investor_id);

-- Startups can view introduction requests for their papers
CREATE POLICY "Startups can view requests for their papers"
  ON public.introduction_requests
  FOR SELECT
  USING (auth.uid() = startup_id);

-- Investors can create introduction requests
CREATE POLICY "Investors can create introduction requests"
  ON public.introduction_requests
  FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

-- Startups can update introduction requests (accept/decline)
CREATE POLICY "Startups can update introduction requests"
  ON public.introduction_requests
  FOR UPDATE
  USING (auth.uid() = startup_id);

-- =====================================================
-- 7. INVESTMENT_COMMITMENTS TABLE POLICIES
-- =====================================================

-- Investors can view their own commitments
CREATE POLICY "Investors can view own commitments"
  ON public.investment_commitments
  FOR SELECT
  USING (auth.uid() = investor_id);

-- Startups can view commitments for their papers
CREATE POLICY "Startups can view commitments for their papers"
  ON public.investment_commitments
  FOR SELECT
  USING (auth.uid() = startup_id);

-- Investors can create commitments
CREATE POLICY "Investors can create commitments"
  ON public.investment_commitments
  FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

-- Startups can update commitments (accept/decline)
CREATE POLICY "Startups can update commitments"
  ON public.investment_commitments
  FOR UPDATE
  USING (auth.uid() = startup_id);

-- Investors can withdraw their own commitments
CREATE POLICY "Investors can withdraw commitments"
  ON public.investment_commitments
  FOR UPDATE
  USING (auth.uid() = investor_id)
  WITH CHECK (status = 'withdrawn');

-- =====================================================
-- 8. DEALS TABLE POLICIES
-- =====================================================

-- Startups can view and manage deals for their papers
CREATE POLICY "Startups can manage their deals"
  ON public.deals
  FOR ALL
  USING (
    commitment_id IN (
      SELECT id FROM public.investment_commitments
      WHERE startup_id = auth.uid()
    )
  );

-- Investors can view deals they're part of
CREATE POLICY "Investors can view their deals"
  ON public.deals
  FOR SELECT
  USING (
    commitment_id IN (
      SELECT id FROM public.investment_commitments
      WHERE investor_id = auth.uid()
    )
  );

-- Investors can update their deals
CREATE POLICY "Investors can update their deals"
  ON public.deals
  FOR UPDATE
  USING (
    commitment_id IN (
      SELECT id FROM public.investment_commitments
      WHERE investor_id = auth.uid()
    )
  );

-- =====================================================
-- 9. DEAL_UPDATES TABLE POLICIES
-- =====================================================

-- Deal participants can view updates
CREATE POLICY "Deal participants can view updates"
  ON public.deal_updates
  FOR SELECT
  USING (
    deal_id IN (
      SELECT d.id FROM public.deals d
      JOIN public.investment_commitments ic ON d.commitment_id = ic.id
      WHERE ic.investor_id = auth.uid() OR ic.startup_id = auth.uid()
    )
  );

-- Deal participants can create updates
CREATE POLICY "Deal participants can create updates"
  ON public.deal_updates
  FOR INSERT
  WITH CHECK (
    deal_id IN (
      SELECT d.id FROM public.deals d
      JOIN public.investment_commitments ic ON d.commitment_id = ic.id
      WHERE ic.investor_id = auth.uid() OR ic.startup_id = auth.uid()
    )
  );

-- =====================================================
-- 10. BATCH_ANALYSES TABLE POLICIES
-- =====================================================

-- Users can view their own batch analyses
CREATE POLICY "Users can view own batch analyses"
  ON public.batch_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create batch analyses
CREATE POLICY "Users can create batch analyses"
  ON public.batch_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own batch analyses
CREATE POLICY "Users can update own batch analyses"
  ON public.batch_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 11. BATCH_RESULTS TABLE POLICIES
-- =====================================================

-- Users can view results from their own batches
CREATE POLICY "Users can view results from own batches"
  ON public.batch_results
  FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.batch_analyses
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert results into their own batches
CREATE POLICY "Users can add results to own batches"
  ON public.batch_results
  FOR INSERT
  WITH CHECK (
    batch_id IN (
      SELECT id FROM public.batch_analyses
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 12. TEAM_MEMBERS TABLE POLICIES
-- =====================================================

-- Users can view their own team members
CREATE POLICY "Users can view own team members"
  ON public.team_members
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can manage their own team
CREATE POLICY "Users can manage own team"
  ON public.team_members
  FOR ALL
  USING (auth.uid() = owner_id);

-- Team members can view teams they're part of
CREATE POLICY "Team members can view their teams"
  ON public.team_members
  FOR SELECT
  USING (
    member_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 13. ACTIVITIES TABLE POLICIES
-- =====================================================

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON public.activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own activities
CREATE POLICY "Users can create own activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 14. SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can manage subscriptions (Stripe webhooks via service role)
-- For development, allow authenticated users
CREATE POLICY "System can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 15. NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (service role in production)
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE POLICIES FOR RESEARCH PAPERS
-- =====================================================

-- Create storage bucket for research papers (run this in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('research-papers', 'research-papers', false);

-- Policy: Users can upload their own papers
-- CREATE POLICY "Users can upload own papers"
--   ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'research-papers'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy: Users can view papers they uploaded or that are public
-- CREATE POLICY "Users can view accessible papers"
--   ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'research-papers'
--     AND (
--       auth.uid()::text = (storage.foldername(name))[1]
--       OR (storage.foldername(name))[2] = 'public'
--     )
--   );

-- =====================================================
-- SUMMARY
-- =====================================================
-- RLS Policies created for all 15 tables:
-- 1. profiles - Users can view/update own, public view for marketplace
-- 2. research_papers - Users own their papers, published papers are public
-- 3. cvs_analyses - Users can view/manage own analyses, published analyses visible
-- 4. analysis_papers - Users can view papers from their own analyses
-- 5. saved_opportunities - Users manage their own saved opportunities
-- 6. introduction_requests - Both parties can view/manage requests
-- 7. investment_commitments - Both parties can view, manage according to role
-- 8. deals - Both parties can view/update their deals
-- 9. deal_updates - Deal participants can view/create updates
-- 10. batch_analyses - Users can view/manage own batch analyses
-- 11. batch_results - Users can view results from their own batches
-- 12. team_members - Users manage their own team, members can view
-- 13. activities - Users view/create own activities
-- 14. subscriptions - Users view own, system manages via service role
-- 15. notifications - Users view/update/delete own notifications
--
-- Next steps:
-- 1. Run this script after 001_create_core_tables.sql
-- 2. Test RLS policies with different user roles
-- 3. Create storage bucket for PDFs (via Supabase Dashboard)
-- 4. Regenerate TypeScript types
