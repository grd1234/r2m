CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY,
  "email" text UNIQUE NOT NULL,
  "full_name" text,
  "user_type" text NOT NULL,
  "company_name" text,
  "role" text,
  "avatar_url" text,
  "subscription_tier" text DEFAULT 'free',
  "subscription_status" text DEFAULT 'active',
  "cvs_reports_used" integer DEFAULT 0,
  "cvs_reports_limit" integer DEFAULT 3,
  "subscription_renews_at" timestamptz,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "research_papers" (
  "id" uuid PRIMARY KEY,
  "uploaded_by" uuid NOT NULL,
  "title" text NOT NULL,
  "authors" text[],
  "abstract" text,
  "keywords" text[],
  "publication_date" date,
  "citation_count" integer DEFAULT 0,
  "doi" text,
  "pdf_url" text,
  "external_id" text,
  "source" text,
  "is_published_to_marketplace" boolean DEFAULT false,
  "marketplace_description" text,
  "tech_category" text,
  "industry" text,
  "stage" text,
  "funding_goal" numeric,
  "view_count" integer DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "cvs_analyses" (
  "id" uuid PRIMARY KEY,
  "paper_id" uuid,
  "analyzed_by" uuid NOT NULL,
  "title" text NOT NULL,
  "query" text NOT NULL,
  "cvs_score" integer,
  "technical_score" integer,
  "market_score" integer,
  "commercial_score" integer,
  "competitive_score" integer,
  "ip_score" integer,
  "risk_score" integer,
  "tam" numeric,
  "trl" integer,
  "target_industry" text,
  "summary" text,
  "recommendations" text,
  "key_strengths" text[],
  "key_risks" text[],
  "go_to_market_strategy" text,
  "status" text DEFAULT 'pending',
  "is_ai_generated" boolean DEFAULT false,
  "analysis_notes" jsonb,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "analysis_papers" (
  "id" uuid PRIMARY KEY,
  "analysis_id" uuid NOT NULL,
  "title" text NOT NULL,
  "authors" text[],
  "abstract" text,
  "publication_date" date,
  "citation_count" integer,
  "url" text,
  "relevance_score" numeric,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "saved_opportunities" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "paper_id" uuid NOT NULL,
  "notes" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "introduction_requests" (
  "id" uuid PRIMARY KEY,
  "paper_id" uuid NOT NULL,
  "investor_id" uuid NOT NULL,
  "startup_id" uuid NOT NULL,
  "message" text,
  "status" text DEFAULT 'pending',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "investment_commitments" (
  "id" uuid PRIMARY KEY,
  "paper_id" uuid NOT NULL,
  "investor_id" uuid NOT NULL,
  "startup_id" uuid NOT NULL,
  "amount" numeric NOT NULL,
  "investment_type" text NOT NULL,
  "timeline" text NOT NULL,
  "message" text,
  "status" text DEFAULT 'pending',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "deals" (
  "id" uuid PRIMARY KEY,
  "commitment_id" uuid NOT NULL,
  "status" text DEFAULT 'committed',
  "progress" integer DEFAULT 0,
  "start_date" date DEFAULT (current_date),
  "expected_close_date" date,
  "actual_close_date" date,
  "milestones" jsonb,
  "documents" jsonb,
  "notes" text,
  "update_history" jsonb,
  "success_fee_paid" boolean DEFAULT false,
  "success_fee_amount" numeric,
  "success_fee_invoice_id" text,
  "success_fee_paid_at" timestamptz,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "deal_updates" (
  "id" uuid PRIMARY KEY,
  "deal_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "old_status" text,
  "new_status" text,
  "note" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "batch_analyses" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "batch_name" text NOT NULL,
  "total_queries" integer NOT NULL,
  "completed_count" integer DEFAULT 0,
  "status" text DEFAULT 'pending',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "batch_results" (
  "id" uuid PRIMARY KEY,
  "batch_id" uuid NOT NULL,
  "query" text NOT NULL,
  "cvs_score" integer,
  "status" text DEFAULT 'pending',
  "result_summary" text,
  "analysis_id" uuid,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "team_members" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid NOT NULL,
  "member_email" text NOT NULL,
  "role" text DEFAULT 'member',
  "permissions" text[],
  "status" text DEFAULT 'invited',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "activities" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "activity_type" text NOT NULL,
  "entity_type" text,
  "entity_id" uuid,
  "description" text,
  "metadata" jsonb,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "stripe_customer_id" text UNIQUE,
  "stripe_subscription_id" text UNIQUE,
  "stripe_price_id" text,
  "tier" text NOT NULL,
  "status" text NOT NULL,
  "current_period_start" timestamptz,
  "current_period_end" timestamptz,
  "cancel_at_period_end" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "link" text,
  "is_read" boolean DEFAULT false,
  "metadata" jsonb,
  "created_at" timestamptz DEFAULT (now())
);

CREATE UNIQUE INDEX "unique_user_paper" ON "saved_opportunities" ("user_id", "paper_id");

COMMENT ON COLUMN "profiles"."id" IS 'References auth.users';

COMMENT ON COLUMN "profiles"."user_type" IS 'startup, investor, corporate_rd, tto, innovation_hub, researcher';

COMMENT ON COLUMN "profiles"."subscription_tier" IS 'free, basic, premium, pro, growth, enterprise';

COMMENT ON COLUMN "profiles"."subscription_status" IS 'active, cancelled, past_due, trialing';

COMMENT ON COLUMN "research_papers"."authors" IS 'Array of author names';

COMMENT ON COLUMN "research_papers"."keywords" IS 'Array of keywords';

COMMENT ON COLUMN "research_papers"."pdf_url" IS 'Supabase Storage URL';

COMMENT ON COLUMN "research_papers"."external_id" IS 'arXiv ID, Semantic Scholar ID, etc.';

COMMENT ON COLUMN "research_papers"."source" IS 'user_upload, arxiv, semantic_scholar, pubmed';

COMMENT ON COLUMN "research_papers"."tech_category" IS 'AI/ML, Biotech, Materials, etc.';

COMMENT ON COLUMN "research_papers"."industry" IS 'Healthcare, Energy, Manufacturing, etc.';

COMMENT ON COLUMN "research_papers"."stage" IS 'Concept, Prototype, Pilot, Market-Ready';

COMMENT ON COLUMN "cvs_analyses"."paper_id" IS 'Can be null for standalone analyses';

COMMENT ON COLUMN "cvs_analyses"."query" IS 'Original search query or analysis prompt';

COMMENT ON COLUMN "cvs_analyses"."cvs_score" IS '0-100, overall Commercial Viability Score';

COMMENT ON COLUMN "cvs_analyses"."technical_score" IS '0-25 points';

COMMENT ON COLUMN "cvs_analyses"."market_score" IS '0-25 points';

COMMENT ON COLUMN "cvs_analyses"."commercial_score" IS '0-20 points';

COMMENT ON COLUMN "cvs_analyses"."competitive_score" IS '0-15 points';

COMMENT ON COLUMN "cvs_analyses"."ip_score" IS '0-10 points';

COMMENT ON COLUMN "cvs_analyses"."risk_score" IS '0-5 points';

COMMENT ON COLUMN "cvs_analyses"."tam" IS 'Total Addressable Market in USD';

COMMENT ON COLUMN "cvs_analyses"."trl" IS 'Technology Readiness Level 1-9';

COMMENT ON COLUMN "cvs_analyses"."key_strengths" IS 'Array of strength descriptions';

COMMENT ON COLUMN "cvs_analyses"."key_risks" IS 'Array of risk descriptions';

COMMENT ON COLUMN "cvs_analyses"."status" IS 'pending, processing, completed, failed';

COMMENT ON COLUMN "analysis_papers"."authors" IS 'Array of author names';

COMMENT ON COLUMN "analysis_papers"."relevance_score" IS 'How relevant this paper is to the analysis';

COMMENT ON COLUMN "saved_opportunities"."notes" IS 'User notes about why they saved this';

COMMENT ON COLUMN "introduction_requests"."investor_id" IS 'Who is requesting introduction';

COMMENT ON COLUMN "introduction_requests"."startup_id" IS 'Who owns the research paper';

COMMENT ON COLUMN "introduction_requests"."message" IS 'Message from investor to startup';

COMMENT ON COLUMN "introduction_requests"."status" IS 'pending, accepted, declined';

COMMENT ON COLUMN "investment_commitments"."amount" IS 'Investment amount in USD';

COMMENT ON COLUMN "investment_commitments"."investment_type" IS 'safe, convertible, equity, revenue, flexible';

COMMENT ON COLUMN "investment_commitments"."timeline" IS '30, 60, 90, flexible days';

COMMENT ON COLUMN "investment_commitments"."status" IS 'pending, accepted, declined, withdrawn';

COMMENT ON COLUMN "deals"."commitment_id" IS 'Created when commitment accepted';

COMMENT ON COLUMN "deals"."status" IS 'committed, due_diligence, term_sheet, closing, closed, failed';

COMMENT ON COLUMN "deals"."progress" IS '0-100 percentage';

COMMENT ON COLUMN "deals"."milestones" IS 'JSON tracking milestone completion';

COMMENT ON COLUMN "deals"."documents" IS 'JSON tracking required documents';

COMMENT ON COLUMN "deals"."update_history" IS 'Array of status changes';

COMMENT ON COLUMN "deals"."success_fee_paid" IS '2-5% platform fee';

COMMENT ON COLUMN "deals"."success_fee_invoice_id" IS 'Stripe invoice ID';

COMMENT ON COLUMN "deal_updates"."user_id" IS 'Who made the update';

COMMENT ON COLUMN "batch_analyses"."status" IS 'pending, processing, completed, failed';

COMMENT ON COLUMN "batch_results"."status" IS 'pending, processing, completed, failed';

COMMENT ON COLUMN "batch_results"."analysis_id" IS 'Link to full analysis if created';

COMMENT ON COLUMN "team_members"."owner_id" IS 'Account owner';

COMMENT ON COLUMN "team_members"."role" IS 'admin, member, viewer';

COMMENT ON COLUMN "team_members"."permissions" IS 'Array of permission strings';

COMMENT ON COLUMN "team_members"."status" IS 'invited, active, inactive';

COMMENT ON COLUMN "activities"."activity_type" IS 'cvs_analysis_completed, paper_uploaded, etc.';

COMMENT ON COLUMN "activities"."entity_type" IS 'paper, analysis, deal, etc.';

COMMENT ON COLUMN "activities"."entity_id" IS 'ID of the related entity';

COMMENT ON COLUMN "subscriptions"."tier" IS 'free, basic, premium, pro, growth, enterprise';

COMMENT ON COLUMN "subscriptions"."status" IS 'active, cancelled, past_due, trialing, incomplete';

COMMENT ON COLUMN "notifications"."type" IS 'cvs_analysis_ready, investor_interest, deal_update, etc.';

COMMENT ON COLUMN "notifications"."link" IS 'URL to relevant page';

ALTER TABLE "research_papers" ADD FOREIGN KEY ("uploaded_by") REFERENCES "profiles" ("id");

ALTER TABLE "cvs_analyses" ADD FOREIGN KEY ("paper_id") REFERENCES "research_papers" ("id");

ALTER TABLE "cvs_analyses" ADD FOREIGN KEY ("analyzed_by") REFERENCES "profiles" ("id");

ALTER TABLE "analysis_papers" ADD FOREIGN KEY ("analysis_id") REFERENCES "cvs_analyses" ("id");

ALTER TABLE "saved_opportunities" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "saved_opportunities" ADD FOREIGN KEY ("paper_id") REFERENCES "research_papers" ("id");

ALTER TABLE "introduction_requests" ADD FOREIGN KEY ("paper_id") REFERENCES "research_papers" ("id");

ALTER TABLE "introduction_requests" ADD FOREIGN KEY ("investor_id") REFERENCES "profiles" ("id");

ALTER TABLE "introduction_requests" ADD FOREIGN KEY ("startup_id") REFERENCES "profiles" ("id");

ALTER TABLE "investment_commitments" ADD FOREIGN KEY ("paper_id") REFERENCES "research_papers" ("id");

ALTER TABLE "investment_commitments" ADD FOREIGN KEY ("investor_id") REFERENCES "profiles" ("id");

ALTER TABLE "investment_commitments" ADD FOREIGN KEY ("startup_id") REFERENCES "profiles" ("id");

ALTER TABLE "deals" ADD FOREIGN KEY ("commitment_id") REFERENCES "investment_commitments" ("id");

ALTER TABLE "deal_updates" ADD FOREIGN KEY ("deal_id") REFERENCES "deals" ("id");

ALTER TABLE "deal_updates" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "batch_analyses" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "batch_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_analyses" ("id");

ALTER TABLE "batch_results" ADD FOREIGN KEY ("analysis_id") REFERENCES "cvs_analyses" ("id");

ALTER TABLE "team_members" ADD FOREIGN KEY ("owner_id") REFERENCES "profiles" ("id");

ALTER TABLE "activities" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");
