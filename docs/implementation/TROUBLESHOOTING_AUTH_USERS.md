# Troubleshooting: Auth Users Foreign Key Error

## The Error You Encountered

```
ERROR: 23503: insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"
DETAIL: Key (id)=(bf048277-94dd-4a2d-90a4-4b52fd831fb5) is not present in table "users".
```

## Root Cause

Your `profiles` table has this constraint:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
);
```

This means:
- ❌ **Cannot** directly INSERT into `profiles` table
- ✅ **Must** first create user in `auth.users` table
- ✅ **Then** the trigger `handle_new_user()` automatically creates profile

## Solution: Use Fixed SQL Script

**File:** `supabase/seed_fake_investors_FIXED.sql`

This script:
1. **Inserts into `auth.users`** first (creates authentication records)
2. **Trigger fires automatically** (`handle_new_user()` creates profiles)
3. **Updates `profiles`** with additional details (company, bio, preferences)

---

## How to Execute Fixed Script

### Step 1: Run the Fixed SQL

```bash
# In Supabase SQL Editor:
# 1. Open: supabase/seed_fake_investors_FIXED.sql
# 2. Copy entire file
# 3. Paste in SQL Editor → Run
# 4. Check output: Should show 10 users + 10 profiles
```

### Step 2: Verify Users Created

```sql
-- Check auth.users table
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY created_at;
```

**Expected:** 10 rows

### Step 3: Verify Profiles Created

```sql
-- Check profiles table
SELECT
  full_name,
  email,
  user_type,
  company_name,
  profile->'domains' AS domains
FROM profiles
WHERE email LIKE 'demo+investor%@infyra.ai'
ORDER BY created_at;
```

**Expected:** 10 rows with full details

---

## Alternative: Use Supabase Dashboard

If SQL insert fails, create users via Supabase Dashboard:

### Method 1: Supabase Auth Dashboard

1. **Go to:** Supabase Dashboard → Authentication → Users
2. **Click:** "Add User" button
3. **Fill in:**
   - Email: `demo+investor_ai_vc@infyra.ai`
   - Password: `demo_password_123`
   - Auto Confirm: ✅ Yes
4. **Click:** "Create User"
5. **Repeat** for all 10 investors

**Then run UPDATE queries:**
```sql
-- After users created, update their profiles
UPDATE profiles
SET
  company_name = 'Catalyst Ventures',
  role = 'Partner',
  avatar_url = 'https://randomuser.me/api/portraits/women/44.jpg',
  subscription_tier = 'premium',
  cvs_reports_used = 12,
  cvs_reports_limit = 50,
  profile = '{...}'::jsonb
WHERE email = 'demo+investor_ai_vc@infyra.ai';
```

### Method 2: Supabase CLI (if you have it)

```bash
# Create user via CLI
supabase auth users create demo+investor_ai_vc@infyra.ai \
  --password demo_password_123 \
  --email-confirm

# Repeat for each investor
```

---

## Understanding the Trigger

Your database has this trigger:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**What it does:**
1. **When** a new user is created in `auth.users`
2. **Then** automatically create a matching row in `profiles`
3. **With** the same `id` and `email`

**Why this design:**
- ✅ Ensures every auth user has a profile
- ✅ Keeps `profiles.id` in sync with `auth.users.id`
- ✅ Prevents orphaned profiles

---

## Common Issues & Fixes

### Issue 1: "relation 'auth.users' does not exist"

**Cause:** Running SQL in wrong schema

**Fix:**
```sql
-- Ensure you're running in the 'public' schema
SET search_path TO public, auth;
```

### Issue 2: "permission denied for table auth.users"

**Cause:** SQL Editor doesn't have permission to insert into auth.users

**Fix:** Use Supabase Dashboard method instead (Authentication → Users → Add User)

### Issue 3: Trigger didn't fire

**Cause:** Trigger may have been disabled or modified

**Fix:** Re-create trigger
```sql
-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Re-create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Issue 4: "function crypt does not exist"

**Cause:** Missing `pgcrypto` extension

**Fix:**
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## Recommended Approach

**For demo/testing:** Use the **FIXED SQL script** (`seed_fake_investors_FIXED.sql`)
- ✅ Fastest method
- ✅ All 10 investors at once
- ✅ Includes full JSONB preferences

**For production:** Use **Supabase Auth API**
- ✅ Proper authentication setup
- ✅ Email confirmation flow
- ✅ Password hashing handled correctly

---

## Quick Fix Summary

1. ❌ **Don't use:** `seed_fake_investors.sql` (old version)
2. ✅ **Do use:** `seed_fake_investors_FIXED.sql` (new version)

**The difference:**
```sql
-- ❌ OLD (doesn't work)
INSERT INTO profiles (id, email, full_name, user_type, ...)
VALUES (gen_random_uuid(), 'email@example.com', ...);

-- ✅ NEW (works)
-- Step 1: Create auth user
INSERT INTO auth.users (id, email, encrypted_password, ...)
VALUES (gen_random_uuid(), 'email@example.com', crypt('password', gen_salt('bf')), ...);

-- Step 2: Trigger automatically creates profile

-- Step 3: Update profile with details
UPDATE profiles
SET company_name = '...', role = '...', profile = '{...}'::jsonb
WHERE email = 'email@example.com';
```

---

## Verification Checklist

After running fixed script:

- [ ] 10 rows in `auth.users` table
- [ ] 10 rows in `profiles` table
- [ ] All profiles have `company_name`
- [ ] All profiles have `profile` JSONB with domains
- [ ] Can query investors by domain:
  ```sql
  SELECT COUNT(*) FROM profiles
  WHERE profile->'domains' ? 'AI/ML'
  AND user_type = 'investor';
  ```

**If all checkboxes pass:** ✅ Ready for Step 3!

---

## Next Steps

1. ✅ Run `seed_fake_investors_FIXED.sql`
2. ✅ Verify with queries above
3. ✅ Continue with Step 1 Part B (n8n integration)
4. ✅ Move to Step 3 (Build Investor Dashboard)
