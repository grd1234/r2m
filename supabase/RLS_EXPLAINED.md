# Row Level Security (RLS) Policies - Explained

**Last Updated:** December 12, 2024

## What are RLS Policies?

**RLS = Row Level Security**

RLS policies are **database-level security rules** that control which rows a user can access in a table. Think of them as filters that automatically apply to every database query based on who's making the request.

## Simple Analogy

Imagine a filing cabinet with folders:
- **Without RLS**: Everyone can see all folders
- **With RLS**: You can only see folders with your name on them (unless the folder is marked "public")

## How RLS Works

### Without RLS:
```sql
-- User A queries the table
SELECT * FROM research_papers;

-- Returns ALL papers from ALL users (security risk!)
```

### With RLS:
```sql
-- User A queries the table
SELECT * FROM research_papers;

-- RLS automatically adds: WHERE uploaded_by = 'user_a_id'
-- Returns ONLY User A's papers
```

## Real Examples from R2M Marketplace

### Example 1: Users Can Only See Their Own Papers

```sql
CREATE POLICY "Users can view own papers"
  ON public.research_papers
  FOR SELECT
  USING (auth.uid() = uploaded_by);
```

**What this means:**
- When User A queries `research_papers`, they only see rows where `uploaded_by = User A's ID`
- When User B queries the same table, they only see rows where `uploaded_by = User B's ID`
- **Automatic, enforced at database level** (can't be bypassed by frontend code)

### Example 2: Published Papers Are Public

```sql
CREATE POLICY "Published papers are viewable"
  ON public.research_papers
  FOR SELECT
  USING (is_published_to_marketplace = true);
```

**What this means:**
- Any authenticated user can see papers where `is_published_to_marketplace = true`
- Private/unpublished papers remain hidden

### Example 3: Two-Party Access (Deals)

```sql
CREATE POLICY "Investors can view their deals"
  ON public.deals
  FOR SELECT
  USING (
    commitment_id IN (
      SELECT id FROM investment_commitments
      WHERE investor_id = auth.uid()
    )
  );
```

**What this means:**
- Investors can only see deals where they're the investor
- Startups can only see deals for their own papers
- Neither party can see other people's deals

## Why RLS is Critical

### ❌ Without RLS (Dangerous):
```typescript
// Frontend code
const { data } = await supabase
  .from('research_papers')
  .select('*')
  .eq('uploaded_by', userId) // ⚠️ Can be manipulated in browser!
```

**Problem**: A malicious user could change `userId` in browser DevTools to see other people's data.

### ✅ With RLS (Secure):
```typescript
// Frontend code
const { data } = await supabase
  .from('research_papers')
  .select('*')
```

**Secure**: Database automatically filters results. Even if a hacker modifies the frontend code, they can't bypass database-level security.

## Types of Operations RLS Controls

1. **SELECT** - What rows can be viewed
2. **INSERT** - What rows can be created
3. **UPDATE** - What rows can be modified
4. **DELETE** - What rows can be removed
5. **ALL** - All operations (shorthand for SELECT + INSERT + UPDATE + DELETE)

## R2M Marketplace RLS Policy Examples

### Scenario 1: Investor Browsing Marketplace

**User Action**: Investor visits marketplace page

**Database Query**:
```typescript
const { data } = await supabase
  .from('research_papers')
  .select('*')
  .eq('is_published_to_marketplace', true)
```

**RLS Applies TWO Policies**:
1. ✅ "Users can view own papers" → Shows papers they uploaded
2. ✅ "Published papers are viewable" → Shows all published papers

**Result**: Investor sees their own papers + all public marketplace listings

### Scenario 2: Startup Viewing Deals

**User Action**: Startup checks investment deals

**Database Query**:
```typescript
const { data } = await supabase
  .from('deals')
  .select('*')
```

**RLS Applies Policy**: "Startups can manage their deals"

**SQL Generated**:
```sql
SELECT * FROM deals
WHERE commitment_id IN (
  SELECT id FROM investment_commitments
  WHERE startup_id = 'current_user_id'
)
```

**Result**: Startup only sees deals for papers they own (can't see competitors' deals)

### Scenario 3: Saving Research Paper to Watchlist

**User Action**: Investor saves a research paper

**Database Query**:
```typescript
const { data } = await supabase
  .from('saved_opportunities')
  .insert({ user_id: userId, paper_id: paperId, notes: 'Interesting tech' })
```

**RLS Applies Policy**: "Users can save opportunities"

**Check**: `user_id` in the insert must match `auth.uid()` (current logged-in user)

**Result**: User can only save opportunities to their own account (can't save to someone else's account)

## RLS Policy Breakdown for R2M Marketplace

### 1. Profiles Table
```sql
-- Users can view/update own profile
USING (auth.uid() = id)

-- Public profiles viewable for marketplace
USING (true)
```
**Purpose**: Users manage own data, but others can see public profile info (name, company) for marketplace listings

### 2. Research Papers Table
```sql
-- Users can view own papers
USING (auth.uid() = uploaded_by)

-- Published papers are public
USING (is_published_to_marketplace = true)
```
**Purpose**: Private papers stay private, marketplace listings are public

### 3. CVS Analyses Table
```sql
-- Users can view own analyses
USING (auth.uid() = analyzed_by)

-- Published paper analyses are public
USING (paper_id IN (
  SELECT id FROM research_papers
  WHERE is_published_to_marketplace = true
))
```
**Purpose**: Users see their own CVS reports, plus CVS scores for public marketplace papers

### 4. Investment Commitments Table
```sql
-- Investors see own commitments
USING (auth.uid() = investor_id)

-- Startups see commitments for their papers
USING (auth.uid() = startup_id)
```
**Purpose**: Both parties see the commitment, no one else can

### 5. Deals Table
```sql
-- Startups manage their deals
USING (commitment_id IN (
  SELECT id FROM investment_commitments
  WHERE startup_id = auth.uid()
))

-- Investors view their deals
USING (commitment_id IN (
  SELECT id FROM investment_commitments
  WHERE investor_id = auth.uid()
))
```
**Purpose**: Only the two parties involved can see/manage the deal

## Key Benefits

✅ **Security enforced at database level** (can't be bypassed)
✅ **Automatic filtering** (no need to add WHERE clauses everywhere)
✅ **Multi-tenant safe** (users can't access each other's data)
✅ **Works with all Supabase client libraries** (JavaScript, Python, etc.)
✅ **No additional backend code needed**
✅ **Protects against frontend manipulation**
✅ **Simplifies frontend code** (no complex permission checks)

## Without RLS vs With RLS

| Scenario | Without RLS | With RLS |
|----------|-------------|----------|
| User A queries table | Sees all data | Sees only authorized data |
| Hacker modifies frontend | Can access anything | Still blocked at database |
| Multi-user app | Need complex filtering logic | Automatic, secure filtering |
| API security | Must validate every request | Database handles it |
| Data leaks | High risk | Minimized risk |
| Development complexity | High (must remember to filter everywhere) | Low (automatic) |

## RLS Policy Components

### 1. Policy Name
```sql
CREATE POLICY "Users can view own papers"
```
Clear, descriptive name explaining what the policy does

### 2. Target Table
```sql
ON public.research_papers
```
Which table the policy applies to

### 3. Operation
```sql
FOR SELECT
```
Which operation (SELECT, INSERT, UPDATE, DELETE, ALL)

### 4. USING Clause (For SELECT/UPDATE/DELETE)
```sql
USING (auth.uid() = uploaded_by)
```
Condition that must be true to view/update/delete a row

### 5. WITH CHECK Clause (For INSERT/UPDATE)
```sql
WITH CHECK (auth.uid() = user_id)
```
Condition that must be true to insert/update a row

## Common RLS Patterns in R2M Marketplace

### Pattern 1: Ownership
```sql
USING (auth.uid() = owner_id)
```
User can only access rows they own

### Pattern 2: Public Data
```sql
USING (is_public = true)
```
Anyone can access rows marked as public

### Pattern 3: Two-Party Access
```sql
USING (auth.uid() = investor_id OR auth.uid() = startup_id)
```
Both parties involved can access the row

### Pattern 4: Nested Permissions
```sql
USING (
  paper_id IN (
    SELECT id FROM research_papers
    WHERE uploaded_by = auth.uid()
  )
)
```
Access based on related table ownership

### Pattern 5: Role-Based Access
```sql
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE user_type = 'investor'
  )
)
```
Access based on user role/type

## Testing RLS Policies

### Test 1: Can User See Own Data?
```typescript
// Login as User A
const { data } = await supabase
  .from('research_papers')
  .select('*')

// Should return only User A's papers
```

### Test 2: Can User See Other's Private Data?
```typescript
// Login as User A
const { data } = await supabase
  .from('research_papers')
  .select('*')
  .eq('id', 'user_b_paper_id') // User B's private paper

// Should return empty array (blocked by RLS)
```

### Test 3: Can User See Public Data?
```typescript
// Login as User A
const { data } = await supabase
  .from('research_papers')
  .select('*')
  .eq('is_published_to_marketplace', true)

// Should return all public papers (including User B's public papers)
```

### Test 4: Can User Modify Other's Data?
```typescript
// Login as User A
const { error } = await supabase
  .from('research_papers')
  .update({ title: 'Hacked!' })
  .eq('id', 'user_b_paper_id')

// Should fail with permission error
```

## Debugging RLS Issues

### Issue: "Row-level security policy violated"

**Cause**: RLS policy is blocking the operation

**Solution**:
1. Check if user is authenticated (`auth.uid()` is not null)
2. Verify the policy conditions match your use case
3. Use Supabase SQL Editor to test policies manually

### Issue: User can't see their own data

**Cause**: Policy condition is incorrect or user_id doesn't match

**Solution**:
```sql
-- Check current user ID
SELECT auth.uid();

-- Check row ownership
SELECT * FROM research_papers WHERE uploaded_by = auth.uid();
```

### Issue: Need to bypass RLS for admin operations

**Solution**: Use service role key (not anon key) for admin operations
```typescript
// Admin operation (server-side only)
const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY)
const { data } = await supabaseAdmin
  .from('research_papers')
  .select('*') // Bypasses RLS
```

## Best Practices

✅ **Always enable RLS** on tables with user data
✅ **Test policies thoroughly** before production
✅ **Use descriptive policy names**
✅ **Keep policies simple** (easier to understand and debug)
✅ **Document complex policies** (add comments explaining logic)
✅ **Use service role carefully** (only on server-side, never expose to frontend)
✅ **Test with multiple user accounts** to ensure isolation
✅ **Monitor failed auth attempts** in Supabase logs

## Bottom Line

**RLS policies = Your database's bouncer.**

They check every request and make sure users only access data they're authorized to see. It's the most important security layer for R2M Marketplace because it protects sensitive research, deals, and user data automatically—even if someone tries to hack the frontend code.

## Related Files

- `/supabase/migrations/001_create_core_tables.sql` - Database schema
- `/supabase/migrations/002_enable_rls.sql` - RLS policy definitions
- `/docs/setup/QUICK_START_DATABASE.md` - Database setup guide

## Further Reading

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Common RLS Patterns](https://supabase.com/docs/guides/auth/row-level-security#policies)
