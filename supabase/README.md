# R2M Marketplace - Supabase Database

This folder contains all database-related files for the R2M Marketplace Supabase backend.

## 📁 Folder Structure

```
supabase/
├── migrations/                      # Database migration files
│   ├── 001_create_core_tables.sql  # Main schema (15 tables + 2 views)
│   └── 002_enable_rls.sql          # Row Level Security policies
├── DATABASE_SCHEMA.dbml             # ER diagram schema (for dbdiagram.io)
├── RLS_EXPLAINED.md                 # Complete guide to Row Level Security
├── GENERATE_ER_DIAGRAM.md           # Instructions for creating ER diagrams
├── SETUP_INSTRUCTIONS.md            # Database setup guide
└── README.md                        # This file
```

## 🗄️ Database Overview

**Database System:** PostgreSQL (via Supabase)
**Total Tables:** 15
**Views:** 2
**Project Ref:** `vqgwzzzjlswyagncyhih`

### Core Tables (15)

1. **profiles** - User accounts and subscription tracking
2. **research_papers** - Research papers + marketplace listings
3. **cvs_analyses** - Commercial Viability Score analyses
4. **analysis_papers** - Papers cited during CVS analyses
5. **saved_opportunities** - User bookmarks/watchlist
6. **introduction_requests** - Investor-startup connection requests
7. **investment_commitments** - Investment offers
8. **deals** - Investment pipeline tracking
9. **deal_updates** - Deal audit log
10. **batch_analyses** - Bulk CVS analysis jobs
11. **batch_results** - Individual batch results
12. **team_members** - Team collaboration
13. **activities** - Activity feed
14. **subscriptions** - Stripe billing
15. **notifications** - In-app notifications

### Views (2)

1. **deal_pipeline** - Comprehensive deal tracking (joins deals + commitments + profiles + papers)
2. **marketplace_opportunities** - Public marketplace listings with CVS scores

## 🚀 Quick Start

### Initial Setup

1. **Create Supabase Project**
   - Go to: https://supabase.com/dashboard
   - Create new project
   - Note your project credentials

2. **Run Migrations**
   ```sql
   -- In Supabase SQL Editor, run these in order:
   -- 1. migrations/001_create_core_tables.sql
   -- 2. migrations/002_enable_rls.sql
   ```

3. **Verify Setup**
   ```sql
   -- Check all tables created
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;

   -- Should return 15 tables
   ```

4. **Update Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://vqgwzzzjlswyagncyhih.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Schema Updates

When you need to modify the database schema:

```bash
# 1. Make changes in Supabase SQL Editor

# 2. Pull changes to local migrations (requires Docker)
export SUPABASE_ACCESS_TOKEN="your_token"
supabase db pull

# 3. Create new migration file
supabase migration new your_migration_name
```

## 📊 Entity Relationship Diagram

### Generate ER Diagram

**Method 1: dbdiagram.io (Recommended)**
1. Open: `DATABASE_SCHEMA.dbml`
2. Copy contents to https://dbdiagram.io/d
3. Export as PNG/PDF

**Method 2: DBeaver**
- Install DBeaver
- Connect to Supabase database
- Right-click schema → View Diagram

See `GENERATE_ER_DIAGRAM.md` for detailed instructions.

## 🔒 Row Level Security (RLS)

All tables have RLS enabled for security. Key patterns:

- **Ownership-based**: Users can only access their own data
- **Role-based**: Different permissions for investors vs startups
- **Marketplace visibility**: Published papers visible to all authenticated users
- **Two-party access**: Introduction requests, commitments, deals accessible to both parties

See `RLS_EXPLAINED.md` for complete guide.

## 🔑 Key Relationships

```
profiles (user)
  ├─→ research_papers (1:many)
  ├─→ cvs_analyses (1:many)
  ├─→ saved_opportunities (1:many)
  ├─→ investment_commitments (1:many as investor)
  ├─→ investment_commitments (1:many as startup)
  └─→ subscriptions (1:1)

research_papers
  ├─→ cvs_analyses (1:many)
  ├─→ introduction_requests (1:many)
  └─→ investment_commitments (1:many)

cvs_analyses
  └─→ analysis_papers (1:many)

investment_commitments
  └─→ deals (1:1 when accepted)

deals
  └─→ deal_updates (1:many)

batch_analyses
  └─→ batch_results (1:many)
```

## 📝 Common Operations

### Create New User Profile
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'John Doe',
      user_type: 'startup'
    }
  }
})
// Profile automatically created via trigger
```

### Upload Research Paper
```typescript
const { data, error } = await supabase
  .from('research_papers')
  .insert({
    uploaded_by: userId,
    title: 'AI-powered Drug Discovery',
    abstract: '...',
    is_published_to_marketplace: true
  })
```

### Create CVS Analysis
```typescript
const { data, error } = await supabase
  .from('cvs_analyses')
  .insert({
    analyzed_by: userId,
    paper_id: paperId,
    title: 'Analysis: AI Drug Discovery',
    query: 'AI drug discovery commercial viability',
    cvs_score: 85,
    technical_score: 22,
    market_score: 23,
    // ... other scores
  })
```

### Save Opportunity to Watchlist
```typescript
const { data, error } = await supabase
  .from('saved_opportunities')
  .insert({
    user_id: userId,
    paper_id: paperId,
    notes: 'Interesting tech for our portfolio'
  })
```

### Create Investment Commitment
```typescript
const { data, error } = await supabase
  .from('investment_commitments')
  .insert({
    paper_id: paperId,
    investor_id: investorId,
    startup_id: startupId,
    amount: 500000,
    investment_type: 'safe',
    timeline: '60',
    message: 'Interested in leading your seed round'
  })
```

## 🧪 Testing Database

### Test User Creation
```sql
-- Create test users with different roles
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES
  ('startup@test.com', crypt('password', gen_salt('bf')), now()),
  ('investor@test.com', crypt('password', gen_salt('bf')), now());

-- Profiles created automatically via trigger
```

### Test RLS Policies
```typescript
// Login as User A
const { data } = await supabase
  .from('research_papers')
  .select('*')
// Should only return User A's papers + public marketplace papers

// Try to access User B's private paper
const { data, error } = await supabase
  .from('research_papers')
  .select('*')
  .eq('id', userBPrivatePaperId)
// Should return empty (RLS blocks access)
```

## 🔧 Maintenance

### Monthly Tasks
- Reset CVS usage counters (free tier)
- Archive old notifications
- Clean up expired deals

### Quarterly Tasks
- Review and optimize indexes
- Analyze query performance
- Update TypeScript types

### Generate TypeScript Types
```bash
# Generate types from live database
supabase gen types typescript --project-id vqgwzzzjlswyagncyhih > src/types/database.types.ts
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Row-level security policy violated"**
- Cause: RLS policy blocking operation
- Fix: Check user is authenticated and policy conditions match

**Issue: "Permission denied for table"**
- Cause: RLS not enabled or no policies defined
- Fix: Ensure RLS enabled and policies created

**Issue: Foreign key constraint violation**
- Cause: Referenced record doesn't exist
- Fix: Verify parent record exists before inserting

### Debug Queries

```sql
-- Check current user
SELECT auth.uid();

-- View RLS policies for a table
SELECT * FROM pg_policies WHERE tablename = 'research_papers';

-- Check table permissions
SELECT * FROM information_schema.role_table_grants
WHERE table_name = 'research_papers';
```

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **RLS Guide**: `RLS_EXPLAINED.md`
- **ER Diagram Guide**: `GENERATE_ER_DIAGRAM.md`
- **Setup Guide**: `SETUP_INSTRUCTIONS.md`

## 🔗 Related Files

- Frontend types: `/src/types/database.types.ts`
- Supabase client: `/src/lib/supabase/client.ts`
- Environment variables: `/.env.local`
- Architecture docs: `/docs/architecture/`

## 📞 Support

- **Supabase Project**: https://supabase.com/dashboard/project/vqgwzzzjlswyagncyhih
- **Database Issues**: Check Supabase Logs in dashboard
- **Schema Changes**: Create migration files in `/migrations`
