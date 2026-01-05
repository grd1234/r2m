# Supabase Database Setup Instructions
**Date:** December 11, 2024
**Estimated Time:** 15-20 minutes

---

## Overview
This guide walks you through setting up the complete R2M Marketplace database schema in Supabase.

## Prerequisites
- ✅ Supabase account (you have this)
- ✅ Project created (vqgwzzzjlswyagncyhih.supabase.co)
- ✅ Environment variables in `.env.local`

---

## Step 1: Access Supabase Dashboard

1. Open your browser and go to: https://supabase.com/dashboard
2. Login with your credentials
3. Click on your project: **vqgwzzzjlswyagncyhih**
4. You should see the project dashboard

---

## Step 2: Run Table Creation Script

1. **Navigate to SQL Editor:**
   - In the left sidebar, click **"SQL Editor"**
   - Click **"New query"** button (top right)

2. **Copy the SQL script:**
   - Open: `supabase/migrations/001_create_tables.sql`
   - Copy the entire contents (Cmd+A, Cmd+C)

3. **Paste and Execute:**
   - Paste into the SQL Editor
   - Click **"Run"** button (or press Cmd+Enter)
   - Wait for execution (~5-10 seconds)

4. **Verify Success:**
   - You should see: "Success. No rows returned"
   - Check the "Table Editor" in left sidebar
   - You should now see 7 new tables:
     - `profiles`
     - `research_papers`
     - `cvs_scores`
     - `subscriptions`
     - `deals`
     - `watchlist`
     - `notifications`

**If you get an error:**
- Check if tables already exist (they might from previous attempts)
- If so, you can skip to Step 3

---

## Step 3: Enable Row Level Security (RLS)

1. **Create New Query:**
   - In SQL Editor, click "New query" again

2. **Copy the RLS script:**
   - Open: `supabase/migrations/002_enable_rls.sql`
   - Copy entire contents

3. **Paste and Execute:**
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for execution (~10-15 seconds)

4. **Verify Success:**
   - Should see: "Success. No rows returned"
   - Go to "Authentication" > "Policies" in left sidebar
   - You should see policies listed for each table

**Important:** RLS ensures users can only access their own data!

---

## Step 4: Create Storage Bucket for PDFs

1. **Navigate to Storage:**
   - Click **"Storage"** in left sidebar
   - Click **"Create a new bucket"**

2. **Configure Bucket:**
   - Name: `research-papers`
   - Public bucket: **No** (keep it private)
   - Click **"Create bucket"**

3. **Set Storage Policies:**
   - Click on the `research-papers` bucket
   - Click **"Policies"** tab
   - Click **"New policy"**

4. **Create Upload Policy:**
   - Template: "Custom"
   - Name: "Users can upload own papers"
   - Policy definition:
   ```sql
   (bucket_id = 'research-papers'::text) AND (auth.uid() = (storage.foldername(name))[1]::uuid)
   ```
   - Allowed operations: **INSERT**
   - Click **"Review"** then **"Save policy"**

5. **Create View Policy:**
   - Click **"New policy"** again
   - Name: "Users can view accessible papers"
   - Policy definition:
   ```sql
   (bucket_id = 'research-papers'::text)
   ```
   - Allowed operations: **SELECT**
   - Click **"Review"** then **"Save policy"**

---

## Step 5: Verify Database Setup

1. **Check Tables:**
   - Go to "Table Editor" in left sidebar
   - Click on `profiles` table
   - You should see column structure (id, email, full_name, etc.)

2. **Test Auth Trigger:**
   - Go to "Authentication" > "Users"
   - You should see your existing test users
   - Check "Table Editor" > `profiles`
   - You should see matching profile entries

3. **Check Indexes:**
   - Go to "Database" > "Indexes"
   - You should see multiple indexes created for faster queries

---

## Step 6: Regenerate TypeScript Types

Now we need to sync the database schema to your TypeScript code.

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```
   - Follow prompts to authenticate

3. **Link Your Project:**
   ```bash
   cd /Users/geetadesaraju/bootcamp2510/your_workspace/sprint4/r2m-marketplace
   supabase link --project-ref vqgwzzzjlswyagncyhih
   ```

4. **Generate Types:**
   ```bash
   supabase gen types typescript --linked > src/types/database.types.ts
   ```

5. **Verify Types:**
   - Open `src/types/database.types.ts`
   - You should see interfaces for all 7 tables
   - Example: `Database['public']['Tables']['profiles']['Row']`

---

## Step 7: Test the Setup

Let's create a simple test to verify everything works.

1. **Test User Profile:**
   - Go to Supabase Dashboard > SQL Editor
   - Run this query:
   ```sql
   SELECT * FROM public.profiles LIMIT 5;
   ```
   - You should see profile data

2. **Test RLS:**
   - Try inserting a test research paper (will fail if not authenticated)
   ```sql
   INSERT INTO public.research_papers (title, abstract)
   VALUES ('Test Paper', 'This should fail due to RLS');
   ```
   - Expected: Error (RLS prevents direct inserts without auth)

3. **Test from Your App:**
   - Start your dev server: `npm run dev`
   - Login to your app
   - Check browser console for any database errors

---

## Common Issues & Solutions

### Issue 1: "Relation already exists"
**Solution:** Tables already created. Skip Step 2, proceed to Step 3.

### Issue 2: "Permission denied for schema public"
**Solution:** You might not have proper permissions. Contact Supabase support or check project settings.

### Issue 3: TypeScript types not generating
**Solution:**
```bash
# Unlink and relink
supabase unlink
supabase link --project-ref vqgwzzzjlswyagncyhih

# Try generating again
supabase gen types typescript --linked > src/types/database.types.ts
```

### Issue 4: RLS policies blocking everything
**Solution:**
- Check if user is authenticated before making queries
- Use Supabase client with proper auth context
- Check policy definitions in Dashboard > Authentication > Policies

---

## Next Steps After Setup

Once database setup is complete:

1. ✅ **Test Authentication Flow**
   - Sign up a new user
   - Check if profile is auto-created
   - Verify RLS policies work

2. ✅ **Build First API Route**
   - Create `/api/research/upload` endpoint
   - Test file upload to storage bucket

3. ✅ **Implement Research Search**
   - Create `/api/research/search` endpoint
   - Query `research_papers` table

4. ✅ **Build CVS Scoring**
   - Create `/api/cvs/analyze` endpoint
   - Insert scores into `cvs_scores` table

---

## Database Schema Overview

### Tables Created:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User accounts | id, email, user_type, subscription_tier |
| `research_papers` | Research data | id, title, abstract, pdf_url |
| `cvs_scores` | Viability scores | id, paper_id, overall_score, dimensions |
| `subscriptions` | Stripe billing | id, user_id, stripe_subscription_id |
| `deals` | Investment tracking | id, paper_id, innovator_id, investor_id |
| `watchlist` | Saved papers | id, user_id, paper_id |
| `notifications` | User alerts | id, user_id, type, message |

---

## Support

**If you encounter issues:**
1. Check Supabase Dashboard > Logs for error messages
2. Review RLS policies in Dashboard > Authentication > Policies
3. Test queries in SQL Editor first before using in code
4. Check environment variables in `.env.local`

**Need help?**
- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

**Setup Complete! 🎉**

You now have a fully functional database schema ready for R2M Marketplace.

Next task: Build the research upload API endpoint.
