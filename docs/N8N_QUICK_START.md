# n8n Integration - Quick Start

**Your n8n workflow is working! Now let's save the results to Supabase.**

---

## 🎯 What We're Fixing

Based on your activity logs, your workflow is running successfully but:
- ❌ CVS score is undefined
- ❌ Papers not saved to database
- ❌ Analyses not saved to database
- ❌ Marketplace shows mock data

**After adding 5 nodes:**
- ✅ CVS score calculated
- ✅ Papers saved to `research_papers` table
- ✅ Analyses saved to `cvs_analyses` table
- ✅ Real data in marketplace

---

## 📖 Complete Guides Available

I've created comprehensive documentation for you:

### 🚀 **START HERE:**
```
/docs/implementation/N8N_STEP_BY_STEP_IMPLEMENTATION.md
```
**Complete step-by-step guide with screenshots and code**

### 📊 **SQL Queries:**
```
/docs/implementation/N8N_SQL_QUERIES.sql
```
**All verification and debugging queries**

### 📚 **Other Guides:**
```
/docs/implementation/N8N_INTEGRATION_INDEX.md  # Navigation
/docs/implementation/N8N_QUICK_REFERENCE.md    # Quick reference
/docs/implementation/N8N_NODE_CODE_SNIPPETS.md # All code
```

---

## ⚡ Super Quick Implementation (30 min)

If you just want to get it working fast:

### 1. Add Supabase Credential (2 min)
```
n8n → Credentials → Add Credential → Supabase

Name: R2M Supabase
Host: https://vqgwzzzjlswyagncyhih.supabase.co
Service Role: [Get from Supabase Dashboard → Settings → API]
```

### 2. Add 6 Nodes to Your Workflow

After your last node in n8n orchestrator, add:

#### Node 1: Function - "Prepare Supabase Insert Data"
Copy code from: `N8N_STEP_BY_STEP_IMPLEMENTATION.md` → Step 3

#### Node 2: Supabase - "Insert Research Paper"
```
Operation: INSERT
Table: research_papers
Data: {{ $json.paper_data }}
Return Fields: id
```

#### Node 3: Supabase - "Insert CVS Analysis"
```
Operation: INSERT
Table: cvs_analyses
Data: {{ Object.assign({}, $json.analysis_data, { paper_id: $('Insert Research Paper').first().json.id }) }}
Return Fields: id
```

#### Node 4: Supabase - "Get User Profile"
```
Operation: GET
Table: profiles
Filter: email = {{ $('Prepare Supabase Insert Data').first().json.user_email }}
Return Fields: id
```

#### Node 5: Supabase - "Update Analysis with User"
```
Operation: UPDATE
Table: cvs_analyses
Filter: id = {{ $('Insert CVS Analysis').first().json.id }}
Update:
  analyzed_by: {{ $('Get User Profile').first().json.id }}
  uploaded_by: {{ $('Get User Profile').first().json.id }}
```

#### Node 6: Function - "Log Success"
Copy code from: `N8N_STEP_BY_STEP_IMPLEMENTATION.md` → Step 8

### 3. Test (5 min)
```
1. Click "Execute Workflow"
2. Wait for all nodes to turn green
3. Check console for "CVS ANALYSIS SAVED TO SUPABASE!"
```

### 4. Verify in Supabase (3 min)
```sql
-- Run in Supabase SQL Editor
SELECT
  p.title,
  c.cvs_score,
  c.tam,
  c.trl
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
ORDER BY c.created_at DESC
LIMIT 1;
```

Should see your latest analysis with CVS score!

---

## 🎯 Detailed Walkthrough

**For complete step-by-step instructions with code:**

👉 **Open:** `/docs/implementation/N8N_STEP_BY_STEP_IMPLEMENTATION.md`

This guide includes:
- ✅ Screenshots and explanations
- ✅ Complete code for all 6 nodes
- ✅ Testing procedures
- ✅ Troubleshooting guide
- ✅ SQL verification queries

**Estimated time:** 1.5-2 hours

---

## 📊 SQL Queries for Verification

**After implementation, run these to verify:**

```sql
-- Quick health check
SELECT
  (SELECT COUNT(*) FROM research_papers) as papers,
  (SELECT COUNT(*) FROM cvs_analyses) as analyses;

-- View latest analysis
SELECT
  p.title as paper_title,
  c.cvs_score,
  c.tam,
  c.trl,
  c.target_industry,
  prof.email as analyzed_by
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
JOIN profiles prof ON c.analyzed_by = prof.id
ORDER BY c.created_at DESC
LIMIT 1;
```

**All SQL queries available in:**
`/docs/implementation/N8N_SQL_QUERIES.sql`

---

## 🚀 After Implementation: Update Marketplace

Once n8n integration works, update marketplace to show real data:

**Edit:** `src/app/marketplace/page.tsx`

```typescript
// Replace mockOpportunities with:
const [opportunities, setOpportunities] = useState([])

useEffect(() => {
  const fetchOpportunities = async () => {
    const { data } = await supabase
      .from('cvs_analyses')
      .select(`
        *,
        research_papers (
          title,
          authors,
          abstract,
          stage
        )
      `)
      .eq('status', 'completed')
      .order('cvs_score', { ascending: false })
      .limit(20)

    setOpportunities(data || [])
  }
  fetchOpportunities()
}, [])
```

Then test:
```bash
npm run dev
# Go to: http://localhost:3000/marketplace
# Should see real opportunities!
```

---

## 📁 All Documentation Files

```
/docs/implementation/
├── N8N_STEP_BY_STEP_IMPLEMENTATION.md  ⭐ Complete guide
├── N8N_SQL_QUERIES.sql                 ⭐ All SQL queries
├── N8N_INTEGRATION_INDEX.md            # Navigation
├── N8N_IMPLEMENTATION_SUMMARY.md       # Overview
├── N8N_INTEGRATION_CHECKLIST.md        # Checklist
├── N8N_NODE_CODE_SNIPPETS.md           # Code snippets
├── N8N_QUICK_REFERENCE.md              # Quick ref
└── N8N_WORKFLOW_DIAGRAM.md             # Diagrams
```

---

## 🎯 Success Checklist

After implementation:

- [ ] All 6 nodes execute without errors (green checkmarks)
- [ ] Console shows "CVS ANALYSIS SAVED TO SUPABASE!"
- [ ] Database has new row in `research_papers`
- [ ] Database has new row in `cvs_analyses`
- [ ] CVS score is calculated (not undefined!)
- [ ] `paper_id` links correctly
- [ ] `analyzed_by` is populated
- [ ] Marketplace shows real data (after UI update)

---

## 🆘 Need Help?

### Common Issues:

**"Cannot read property 'json' of undefined"**
→ Check node names match in code

**"Foreign key violation"**
→ Run: `supabase/seed_investors_YOUR_EMAIL.sql`

**"CVS score is 0"**
→ Check agent output field names in Node 1

**For detailed troubleshooting:**
→ See: `N8N_STEP_BY_STEP_IMPLEMENTATION.md` → Troubleshooting section

---

## ⏱️ Time Estimate

- **Quick implementation:** 30-45 min (copy/paste code)
- **Full walkthrough:** 1.5-2 hours (learn and understand)
- **Testing:** 15 min
- **Marketplace update:** 10 min

**Total:** ~2 hours for complete implementation

---

**Ready to start?**

👉 **Open:** `/docs/implementation/N8N_STEP_BY_STEP_IMPLEMENTATION.md`

Good luck! 🚀
