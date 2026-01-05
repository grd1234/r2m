# R2M Marketplace Implementation Plan
**Date:** December 11, 2024, 9:30 PM PST
**Status:** Ready to Begin Implementation

---

## Current State Assessment

### What Actually Exists:
✅ **Supabase Integration**
- Supabase client/server setup (`src/lib/supabase/`)
- Database types generated (`src/types/database.types.ts`)
- User store (Zustand) with profile management (`src/store/useUserStore.ts`)
- Environment variables configured (`.env.local`)
- Auth working (signup/login flows use Supabase)

✅ **UI/Frontend Complete**
- Landing page with Hero, Persona Roles, CVS Explainer, etc.
- Navigation with persona-specific menus
- Pricing page (6 tiers)
- How It Works, About pages
- Signup/Login flows for 3 personas (Innovator, Investor, Researcher)
- Placeholder pages: Dashboard, Marketplace, Analysis, Deals

### What Needs Implementation:
❌ Database Schema (no tables exist in Supabase yet)
❌ Stripe Integration (folder exists but empty)
❌ Backend Logic (no API routes, CVS scoring, research search)
❌ File uploads (research papers)
❌ Real data integration

---

## Implementation Roadmap - Phase by Phase

### **PHASE 1: Database Foundation (Week 1)**
**Goal:** Create all database tables and relationships in Supabase

#### Step 1.1: Design Database Schema
Tables needed:
1. `profiles` (extends Supabase auth.users)
2. `research_papers` (stores uploaded/analyzed research)
3. `cvs_scores` (Commercial Viability Score data)
4. `subscriptions` (user subscription tiers)
5. `deals` (investment opportunities tracking)
6. `watchlist` (saved research papers)
7. `notifications` (user notifications)

#### Step 1.2: Create Tables in Supabase
- Access Supabase Dashboard
- SQL Editor to create tables
- Set up relationships (foreign keys)
- Configure Row Level Security (RLS) policies

#### Step 1.3: Update TypeScript Types
- Regenerate database types from Supabase
- Update `src/types/database.types.ts`

**Deliverable:** Fully functional database schema with RLS policies

---

### **PHASE 2: Research Search & Storage (Week 2)**
**Goal:** Enable users to search and upload research papers

#### Step 2.1: Supabase Storage Setup
- Create storage bucket for research papers (PDFs)
- Configure upload policies (auth required)
- Set up file size limits (max 50MB per paper)

#### Step 2.2: Research Upload API
- Create API route: `POST /api/research/upload`
- Handle file upload to Supabase Storage
- Extract metadata (title, authors, abstract)
- Store in `research_papers` table

#### Step 2.3: Research Search API
**Option A (MVP):** Simple keyword search in database
**Option B (Advanced):** Integrate external APIs:
- arXiv API (free, academic papers)
- Semantic Scholar API (free, 100M+ papers)

Create API route: `GET /api/research/search?q=query`

#### Step 2.4: Frontend Integration
- Connect `/analysis/search` page to search API
- Display search results (papers list)
- Add "Analyze" button to request CVS score

**Deliverable:** Working research search and upload functionality

---

### **PHASE 3: CVS Scoring Engine (Week 3)**
**Goal:** Generate Commercial Viability Scores for research papers

#### Step 3.1: CVS Scoring Logic (Initial Mock)
Create scoring algorithm with 6 dimensions:
1. **Technical Merit (25 points):** TRL level, innovation impact
2. **Commercial Potential (25 points):** Revenue model, market fit
3. **Market Opportunity (20 points):** TAM, growth rate
4. **Competitive Position (15 points):** Uniqueness, advantages
5. **IP Landscape (10 points):** Patentability, FTO
6. **Risk Assessment (5 points):** Technical, market, regulatory risks

**For MVP:** Use rule-based scoring (no AI yet)
- Extract keywords from abstract
- Assign scores based on keyword matching
- Calculate total CVS (0-100)

#### Step 3.2: CVS Scoring API
- Create API route: `POST /api/cvs/analyze`
- Accept research paper data
- Run scoring algorithm
- Store results in `cvs_scores` table
- Return breakdown by dimension

#### Step 3.3: Frontend Integration
- Display CVS score on `/analysis/results/[id]`
- Show breakdown chart (6 dimensions)
- Add explainer text for each dimension
- Export PDF report functionality

**Deliverable:** Working CVS scoring with visual breakdown

---

### **PHASE 4: Marketplace & Discovery (Week 4)**
**Goal:** Allow investors to browse research opportunities

#### Step 4.1: Marketplace Listing API
- Create API route: `GET /api/marketplace`
- Fetch research with CVS scores ≥60
- Support filters: CVS score, industry, TRL, market size
- Pagination (20 results per page)

#### Step 4.2: Opportunity Detail Page
- Create API route: `GET /api/marketplace/[id]`
- Display full CVS breakdown
- Show researcher contact info (if opted-in)
- "Express Interest" button

#### Step 4.3: Frontend Integration
- Connect `/marketplace` to listing API
- Add filter UI (CVS range slider, dropdowns)
- Display opportunity cards (title, CVS, summary)
- Link to `/marketplace/[id]` detail pages

**Deliverable:** Functional marketplace for browsing research

---

### **PHASE 5: Dashboard & User Features (Week 5)**
**Goal:** Personalized dashboards for each persona

#### Step 5.1: Innovator Dashboard
- My Research (uploaded papers)
- CVS Scores (analysis results)
- Watchlist (saved papers)
- Recent Activity

#### Step 5.2: Investor Dashboard
- Browse Opportunities (quick access to marketplace)
- Saved Opportunities (watchlist)
- Deals in Progress
- Investment Stats

#### Step 5.3: Researcher Dashboard
- Submitted Research
- CVS Scores Received
- Marketplace Visibility Toggle
- Investor Interest Notifications

**Deliverable:** Working dashboards for all personas

---

### **PHASE 6: Deals & Messaging (Week 6)**
**Goal:** Facilitate connections between innovators and investors

#### Step 6.1: Deal Tracking System
- Create API routes for deals (CRUD)
- Deal statuses: Interested → Under Review → Due Diligence → Closed
- Store in `deals` table

#### Step 6.2: Messaging System
**Option A (Simple):** Email notifications
**Option B (Advanced):** In-app messaging

For MVP, use email:
- Investor clicks "Express Interest"
- Email sent to innovator with investor contact info
- Tracked in `deals` table

#### Step 6.3: Frontend Integration
- `/deals` page shows all deals
- Status badges (color-coded)
- Filter by status
- Deal detail view

**Deliverable:** Working deal tracking system

---

### **PHASE 7: Stripe Integration & Subscriptions (Week 7)**
**Goal:** Implement payment system for pricing tiers

#### Step 7.1: Stripe Setup
- Create Stripe account
- Get API keys (test mode)
- Create products in Stripe for each tier:
  - Free (no charge)
  - Innovator Basic ($100/year)
  - Innovator Premium ($300/year)
  - Innovator Pro ($500/year)
  - Growth ($5,000/year)
  - Enterprise (custom)

#### Step 7.2: Stripe Integration
- Install Stripe SDK: `npm install stripe @stripe/stripe-js`
- Create Stripe client (`src/lib/stripe/`)
- Checkout session API: `POST /api/stripe/create-checkout`
- Webhook handler: `POST /api/stripe/webhook`

#### Step 7.3: Subscription Management
- Store subscription data in `subscriptions` table
- Check subscription status before allowing features
- Usage tracking (CVS reports per month)
- Show "Upgrade" prompts when limit reached

#### Step 7.4: Frontend Integration
- "Subscribe" buttons on pricing page
- Account settings page (manage subscription)
- Billing history
- Cancel/upgrade flows

**Deliverable:** Working payment and subscription system

---

### **PHASE 8: Advanced Features (Week 8+)**
**Goal:** Enhance platform with AI and advanced features

#### Step 8.1: AI-Powered CVS Scoring
- Integrate OpenAI API or Claude API
- Use LLM to analyze research abstracts
- Generate detailed insights (not just scores)
- Implement 11-agent multi-agent system

#### Step 8.2: Semantic Search
- Implement vector embeddings for papers
- Use Supabase pgvector extension
- Enable semantic similarity search

#### Step 8.3: Email Notifications
- Welcome emails on signup
- CVS score ready notifications
- Investor interest alerts
- Weekly digest of new research

#### Step 8.4: Admin Dashboard
- View all users, research, deals
- Moderate content
- Analytics (signups, revenue, usage)

**Deliverable:** Production-ready platform with advanced features

---

## Step-by-Step Implementation Guide

### **How to Execute This Plan**

#### **Step 1: Database Schema Creation**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project (vqgwzzzjlswyagncyhih.supabase.co)
3. Go to **SQL Editor**
4. Create new query and run SQL to create tables
5. Enable RLS (Row Level Security) policies
6. Regenerate TypeScript types

#### **Step 2: API Routes Development**
1. Create API routes in `src/app/api/` directory
2. Use Next.js App Router API routes
3. Connect to Supabase using server client
4. Test with Postman or curl

#### **Step 3: Frontend Integration**
1. Update placeholder pages with real API calls
2. Add loading states, error handling
3. Use React Query or SWR for data fetching
4. Test user flows end-to-end

#### **Step 4: Testing**
1. Manual testing of all flows
2. Test each persona (Innovator, Investor, Researcher)
3. Test edge cases (no results, errors, limits)
4. Browser testing (Chrome, Safari, Firefox)

#### **Step 5: Deployment**
1. Deploy to Vercel (already set up with Next.js)
2. Configure production environment variables
3. Test on production URL
4. Monitor errors with Sentry or similar

---

## Next Immediate Actions (This Week)

### Priority 1: Database Schema ✅
**Action:** Create SQL script for all tables
**Owner:** You + Claude
**Timeline:** Today/Tomorrow

### Priority 2: Research Upload
**Action:** Build file upload functionality
**Owner:** You + Claude
**Timeline:** 2-3 days

### Priority 3: CVS Scoring (Mock)
**Action:** Create rule-based scoring algorithm
**Owner:** You + Claude
**Timeline:** 3-4 days

### Priority 4: Search API
**Action:** Integrate arXiv or build simple search
**Owner:** You + Claude
**Timeline:** 2-3 days

**Total Week 1 Goal:** Database + Upload + Mock CVS Scoring

---

## Success Metrics

### Week 1 Success:
- [ ] Database schema created (7 tables)
- [ ] User can upload research paper (PDF)
- [ ] Paper stored in Supabase Storage
- [ ] Metadata stored in database
- [ ] Basic CVS score calculated (mock)

### Week 2 Success:
- [ ] User can search research papers
- [ ] Search returns relevant results
- [ ] CVS score displayed with breakdown
- [ ] User can save papers to watchlist

### Week 3 Success:
- [ ] Marketplace listing functional
- [ ] Filters working (CVS, industry, TRL)
- [ ] Opportunity detail page complete
- [ ] "Express Interest" creates deal record

### Week 4 Success:
- [ ] Dashboard personalized for each persona
- [ ] Deal tracking system operational
- [ ] Email notifications sent

### Week 5 Success:
- [ ] Stripe integration complete
- [ ] Subscriptions created and tracked
- [ ] Usage limits enforced
- [ ] Payment flow tested

---

## Risk Mitigation

### Risk 1: AI API Costs
**Solution:** Start with mock/rule-based CVS scoring, add AI later

### Risk 2: External API Rate Limits (arXiv, Semantic Scholar)
**Solution:** Cache results, implement pagination, use multiple APIs

### Risk 3: User Upload Abuse (Large Files)
**Solution:** Set file size limits (50MB), scan for malware

### Risk 4: Stripe Payment Issues
**Solution:** Use Stripe test mode extensively, implement retry logic

### Risk 5: Scope Creep
**Solution:** Stick to MVP features, defer "nice to have" to Phase 8

---

## Tools & Technologies Used

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (for PDFs)
- **Payments:** Stripe
- **AI (Future):** OpenAI API or Anthropic Claude API
- **Deployment:** Vercel
- **Analytics (Future):** PostHog or Mixpanel

---

## Questions to Answer Before Starting

1. **Do we have admin access to Supabase Dashboard?** (Yes - credentials in .env.local)
2. **What's our target launch date?** (Define based on sprint goals)
3. **Do we need real AI scoring immediately or can we mock it?** (Recommend mock first)
4. **Which research APIs to integrate first?** (Recommend arXiv - free, reliable)
5. **What's our budget for AI API calls?** (Affects Phase 8 timeline)

---

## Appendix: Database Schema Preview

### Table: `profiles`
```sql
id UUID PRIMARY KEY (references auth.users)
email TEXT
full_name TEXT
user_type TEXT (innovator/investor/researcher)
company_name TEXT
subscription_tier TEXT (free/basic/premium/pro/growth/enterprise)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Table: `research_papers`
```sql
id UUID PRIMARY KEY
uploaded_by UUID (references profiles)
title TEXT
authors TEXT[]
abstract TEXT
pdf_url TEXT (Supabase Storage URL)
keywords TEXT[]
publication_date DATE
source TEXT (arxiv/semantic_scholar/user_upload)
created_at TIMESTAMP
```

### Table: `cvs_scores`
```sql
id UUID PRIMARY KEY
paper_id UUID (references research_papers)
overall_score INTEGER (0-100)
technical_merit INTEGER (0-25)
commercial_potential INTEGER (0-25)
market_opportunity INTEGER (0-20)
competitive_position INTEGER (0-15)
ip_landscape INTEGER (0-10)
risk_assessment INTEGER (0-5)
analysis_notes JSONB
created_at TIMESTAMP
```

### Table: `deals`
```sql
id UUID PRIMARY KEY
paper_id UUID (references research_papers)
innovator_id UUID (references profiles)
investor_id UUID (references profiles)
status TEXT (interested/under_review/due_diligence/closed)
notes TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

*Additional tables: `subscriptions`, `watchlist`, `notifications` - detailed schemas in Phase 1*

---

**END OF IMPLEMENTATION PLAN**

*Last Updated: December 11, 2024, 9:30 PM PST*
