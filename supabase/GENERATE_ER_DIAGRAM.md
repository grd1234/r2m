# How to Generate ER Diagram for R2M Marketplace

## Quick Method: dbdiagram.io (5 minutes)

### Steps:

1. **Open dbdiagram.io**
   - Go to: https://dbdiagram.io/d

2. **Copy the DBML schema**
   - Open: `docs/architecture/DATABASE_SCHEMA.dbml`
   - Copy the entire contents

3. **Paste into dbdiagram.io**
   - Paste into the left editor panel
   - The ER diagram will auto-generate on the right

4. **Export your diagram**
   - Click **"Export"** in the top menu
   - Choose format:
     - **PNG** - For presentations/docs
     - **PDF** - For printing/sharing
     - **SQL** - To get PostgreSQL schema
     - **Share Link** - To collaborate

### Features you'll see in the diagram:

✅ **All 15 tables** visualized
✅ **Foreign key relationships** shown with arrows
✅ **Table columns** with data types
✅ **Primary keys** highlighted
✅ **Constraints** (unique, not null, defaults)
✅ **Notes** explaining each field

---

## Alternative Method: Supabase CLI (Requires Docker)

### Prerequisites:
- Docker Desktop must be running
- Supabase CLI installed ✅ (already done)

### Steps:

1. **Start Docker Desktop**

2. **Login to Supabase** (already linked ✅)

3. **Generate schema diff**
```bash
export SUPABASE_ACCESS_TOKEN="your_access_token"
supabase db diff --schema public
```

4. **Pull current schema**
```bash
supabase db pull
```

This will create migration files in `supabase/migrations/` based on your live database.

---

## Alternative Method: DBeaver (Desktop Tool)

### Steps:

1. **Install DBeaver** (free)
   - Download: https://dbeaver.io/download/

2. **Create New Connection**
   - Database: PostgreSQL
   - Host: `aws-0-us-east-1.pooler.supabase.com`
   - Port: `6543`
   - Database: `postgres`
   - Username: `postgres.vqgwzzzjlswyagncyhih`
   - Password: [Your database password from Supabase Settings → Database]

3. **Generate ER Diagram**
   - Right-click on `public` schema
   - Select **"View Diagram"** or **"ER Diagram"**
   - DBeaver generates interactive diagram

4. **Export**
   - File → Export → Image (PNG/SVG)

---

## Recommended Workflow

### For Quick Visualization:
✅ **Use dbdiagram.io** (5 minutes, no setup required)

### For Database Management:
✅ **Use DBeaver** (free, powerful, includes SQL editor)

### For Version Control:
✅ **Use Supabase CLI** with `db pull` to sync schema changes

---

## Current Schema Overview

**15 Tables:**
1. `profiles` - User accounts
2. `research_papers` - Research papers + marketplace listings
3. `cvs_analyses` - Commercial Viability Score analyses
4. `analysis_papers` - Papers cited in analyses
5. `saved_opportunities` - User bookmarks/watchlist
6. `introduction_requests` - Investor-startup connection requests
7. `investment_commitments` - Investment offers
8. `deals` - Investment pipeline tracking
9. `deal_updates` - Deal audit log
10. `batch_analyses` - Bulk CVS analysis jobs
11. `batch_results` - Individual batch results
12. `team_members` - Team collaboration
13. `activities` - Activity feed
14. `subscriptions` - Stripe billing
15. `notifications` - In-app notifications

**2 Views:**
1. `deal_pipeline` - Comprehensive deal tracking
2. `marketplace_opportunities` - Public marketplace listings

**Key Relationships:**
- One-to-Many: Profile → Research Papers, CVS Analyses, Deals
- Many-to-Many: Users ↔ Research Papers (via saved_opportunities)
- Two-Party: Introduction Requests, Investment Commitments, Deals

---

## Files:

- **DBML Schema**: `docs/architecture/DATABASE_SCHEMA.dbml`
- **SQL Migrations**: `supabase/migrations/001_create_core_tables.sql`
- **RLS Policies**: `supabase/migrations/002_enable_rls.sql`
- **RLS Guide**: `docs/architecture/RLS_EXPLAINED.md`

---

## Next Steps:

1. ✅ Generate ER diagram using dbdiagram.io
2. Export as PNG and save to `docs/architecture/ER_DIAGRAM.png`
3. Use diagram for:
   - Documentation
   - Team onboarding
   - Investor presentations
   - Database design reviews
