# Quick Start Checklist: Steps 1 & 2
**Estimated Time:** 2-3 hours

---

## ✅ Part A: Database Preparation (30 min)

### 1. Run Migration 009
```bash
# In Supabase SQL Editor:
# File: supabase/migrations/009_add_researcher_connections.sql
```
- [ ] Copy entire file to Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"

**Test:**
```sql
SELECT COUNT(*) FROM researcher_connections;
SELECT COUNT(*) FROM analytics_events;
```

---

### 2. Seed Fake Investors
```bash
# In Supabase SQL Editor:
# File: supabase/seed_fake_investors.sql
```
- [ ] Copy entire file to Supabase SQL Editor
- [ ] Click "Run"
- [ ] Check output shows 10 investor profiles

**Test:**
```sql
SELECT COUNT(*) FROM profiles WHERE email LIKE 'demo+investor%@infyra.ai';
-- Expected: 10
```

---

## ✅ Part B: n8n Integration (1.5-2 hours)

### 1. Open n8n Workflow
- [ ] Open `00 - Orchestrator Agent_emailFixed`
- [ ] Navigate to end of workflow (after "Calculate CVS")

### 2. Add 5 Nodes
Refer to: `N8N_SUPABASE_INTEGRATION_GUIDE.md`

**Node 1: Prepare Supabase Insert Data**
- [ ] Type: Code (JavaScript)
- [ ] Copy code from guide
- [ ] Position: After "Calculate Commercial Viability Score"

**Node 2: Lookup User Profile ID**
- [ ] Type: Supabase (Read)
- [ ] Table: `profiles`
- [ ] Match: `email` equals `{{ $json.user_email }}`

**Node 3: Insert Research Paper**
- [ ] Type: HTTP Request
- [ ] Method: POST
- [ ] URL: `https://vqgwzzzjlswyagncyhih.supabase.co/rest/v1/research_papers`
- [ ] Headers: Authorization, apikey, Content-Type
- [ ] Copy body from guide

**Node 4: Insert CVS Analysis**
- [ ] Type: HTTP Request
- [ ] Method: POST
- [ ] URL: `https://vqgwzzzjlswyagncyhih.supabase.co/rest/v1/cvs_analyses`
- [ ] Headers: Same as Node 3
- [ ] Copy body from guide

**Node 5: Log Success**
- [ ] Type: Code (JavaScript)
- [ ] Copy code from guide
- [ ] Connect to existing "Format Email" node

### 3. Set Environment Variables
- [ ] Add `SUPABASE_URL` to n8n credentials
- [ ] Add `SUPABASE_ANON_KEY` to n8n credentials
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to n8n credentials

**Get keys:** Supabase Dashboard → Settings → API

### 4. Test Execution
- [ ] Click "Execute Workflow" in n8n
- [ ] Watch all 5 nodes execute successfully
- [ ] Check Supabase Table Editor for new rows

**Verify:**
```sql
SELECT
  rp.title AS paper_title,
  ca.cvs_score,
  ca.query
FROM cvs_analyses ca
JOIN research_papers rp ON ca.paper_id = rp.id
ORDER BY ca.created_at DESC
LIMIT 5;
```

---

## ✅ Part C: Researcher Mapping (30 min)

### 1. Verify Researcher Mapping File
- [ ] File exists: `supabase/fake_researcher_mapping.json`
- [ ] Contains 10 researcher personas
- [ ] Maps domains to emails

### 2. Set Up Email Aliases (if using Gmail)
- [ ] Create alias: `yourname+researcher_ai@gmail.com`
- [ ] Create alias: `yourname+researcher_healthcare@gmail.com`
- [ ] Create alias: `yourname+researcher_climate@gmail.com`
- [ ] Set up Gmail filters (optional, for organization)

### 3. Create n8n Researcher Mapping Function
- [ ] Create new Code node (for Step 5, save for later)
- [ ] Copy function from `FAKE_DATA_GENERATION_GUIDE.md`
- [ ] Test: Input `domain='AI/ML'` → Output `Dr. Maria Lopez`

---

## 🎯 Final Verification

### Database Check
```sql
-- Should return 10
SELECT COUNT(*) FROM profiles WHERE email LIKE 'demo+investor%@infyra.ai';

-- Should return 1+
SELECT COUNT(*) FROM researcher_connections;

-- Should return 1+
SELECT COUNT(*) FROM analytics_events;
```

### n8n Check
- [ ] All 5 new nodes added
- [ ] Test execution successful
- [ ] No errors in node logs
- [ ] Email report still sends

### Data Check
```sql
-- Should return 1+ row
SELECT
  rp.title,
  ca.cvs_score,
  p.email
FROM cvs_analyses ca
JOIN research_papers rp ON ca.paper_id = rp.id
JOIN profiles p ON ca.analyzed_by = p.id
ORDER BY ca.created_at DESC
LIMIT 1;
```

---

## ✅ Success Criteria

**You're ready for Step 3 if:**
- ✅ Migration 009 applied (2 new tables)
- ✅ 10 fake investors in database
- ✅ 5 n8n nodes added and tested
- ✅ Test CVS analysis stored in Supabase
- ✅ Researcher mapping file created
- ✅ Email aliases set up

**Next:** Start Step 3 (Build Investor Dashboard)

---

## 📞 Troubleshooting

**Problem:** RLS policy violated
**Fix:**
```sql
ALTER TABLE research_papers DISABLE ROW LEVEL SECURITY;
ALTER TABLE cvs_analyses DISABLE ROW LEVEL SECURITY;
```

**Problem:** Foreign key constraint violation
**Fix:**
```sql
-- Create test user if doesn't exist
INSERT INTO profiles (id, email, user_type, full_name)
VALUES (gen_random_uuid(), 'your-email@gmail.com', 'startup', 'Test User');
```

**Problem:** n8n node returns "undefined"
**Fix:** Check previous node output structure, update expression path

---

**Time Check:**
- Part A: ⏱️ 30 min
- Part B: ⏱️ 1.5-2 hours
- Part C: ⏱️ 30 min
- **Total: 2.5-3 hours**

Good luck! 🚀
