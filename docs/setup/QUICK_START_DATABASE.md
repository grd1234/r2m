# Quick Start: Database Setup
**Date:** December 11, 2024
**Estimated Time:** 10 minutes

---

## Execute These Steps Now

### Step 1: Open Supabase Dashboard (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Login with your credentials
3. Click on project: **vqgwzzzjlswyagncyhih**

---

### Step 2: Run Table Creation Script (3 minutes)

1. Click **"SQL Editor"** in left sidebar
2. Click **"New query"** button (top right)
3. Open this file: `supabase/migrations/001_create_tables.sql`
4. Copy **entire contents** (Cmd+A, Cmd+C)
5. Paste into SQL Editor
6. Click **"Run"** (or Cmd+Enter)
7. Wait 5-10 seconds
8. Verify: "Success. No rows returned"

**Expected Result:**
- 7 new tables created:
  - profiles
  - research_papers
  - cvs_scores
  - subscriptions
  - deals
  - watchlist
  - notifications

---

### Step 3: Enable Row Level Security (3 minutes)

1. In SQL Editor, click **"New query"**
2. Open this file: `supabase/migrations/002_enable_rls.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Wait 10-15 seconds
7. Verify: "Success. No rows returned"

**Expected Result:**
- RLS enabled on all 7 tables
- Policies created (check: Authentication > Policies)

---

### Step 4: Create Storage Bucket (2 minutes)

1. Click **"Storage"** in left sidebar
2. Click **"Create a new bucket"**
3. Settings:
   - Name: `research-papers`
   - Public bucket: **No** (keep private)
4. Click **"Create bucket"**

**Expected Result:**
- New bucket: `research-papers` visible in Storage

---

### Step 5: Verify Setup (1 minute)

Check these 3 things:

1. **Tables**: Go to "Table Editor" → See 7 tables
2. **Policies**: Go to "Authentication" > "Policies" → See policies listed
3. **Storage**: Go to "Storage" → See `research-papers` bucket

---

## What This Accomplishes

✅ Complete database schema (7 tables)
✅ Row Level Security protecting user data
✅ PDF storage bucket for research papers
✅ Auto-profile creation on user signup
✅ Ready for TypeScript type generation

---

## Next Step After This

Once you've completed these 4 steps in Supabase Dashboard, come back and we'll:

1. Regenerate TypeScript types
2. Test the database connection
3. Build the first API route (research upload)

---

## If You Get Errors

**"Relation already exists"**
→ Tables already created. Skip Step 2, proceed to Step 3.

**"Permission denied"**
→ Check project permissions. You should be the owner.

**Can't find SQL Editor**
→ Look in left sidebar under "SQL Editor" (below "Table Editor")

---

**Ready?** Open Supabase Dashboard and execute Steps 1-4 now.

I'll wait here for you to complete the setup, then we'll continue with type generation.
