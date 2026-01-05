# n8n → Supabase Integration - Implementation Summary

**Date:** December 16, 2025
**Status:** Documentation complete, ready for implementation
**Estimated Time:** 1.5-2 hours

---

## 🎯 Objective

Connect the n8n CVS analysis orchestrator workflow to Supabase database so that:
- ✅ Analysis results automatically save to database
- ✅ Marketplace displays real opportunities (not mock data)
- ✅ Users can publish opportunities from analyses
- ✅ Foundation for investor matching system

---

## 📦 What Was Created

### 1. **N8N_INTEGRATION_CHECKLIST.md** (Step-by-step guide)
   - **Purpose:** Complete walkthrough with 7 detailed steps
   - **Time:** 1.5-2 hours to implement
   - **Contents:**
     - Prerequisites checklist
     - Supabase credential setup
     - 5 node implementations with code
     - Testing procedures
     - Troubleshooting guide
   - **Use case:** Follow this if implementing for the first time

### 2. **N8N_NODE_CODE_SNIPPETS.md** (Copy/paste code)
   - **Purpose:** Ready-to-use JavaScript code for all 5 nodes
   - **Time:** 5-10 min per node
   - **Contents:**
     - Complete Function node code (Nodes 1 & 5)
     - Supabase node configuration (Nodes 2, 3, 4A, 4B)
     - Expression snippets
     - Alternative implementations (demo mode)
   - **Use case:** Quick reference while building in n8n UI

### 3. **N8N_WORKFLOW_DIAGRAM.md** (Visual reference)
   - **Purpose:** Visual workflow architecture and data flow
   - **Contents:**
     - Complete workflow diagram (existing + new nodes)
     - Data flow from n8n → Supabase
     - Database schema visualization
     - Expression reference guide
     - Success indicators
   - **Use case:** Understand architecture and troubleshoot issues

### 4. **N8N_QUICK_REFERENCE.md** (Quick lookup card)
   - **Purpose:** Print-friendly reference card
   - **Contents:**
     - 5-minute setup checklist
     - Node summary table
     - Common errors with fixes
     - Testing commands
     - Pro tips
   - **Use case:** Keep open while implementing

### 5. **N8N_SUPABASE_INTEGRATION_GUIDE.md** (Existing, detailed data mapping)
   - **Purpose:** Comprehensive data mapping reference
   - **Contents:**
     - Detailed field mappings (n8n → Supabase)
     - TRL to Stage conversion logic
     - JSONB structure specifications
   - **Use case:** Reference when customizing data mappings

---

## 🏗️ Architecture Overview

### Current n8n Workflow (9 nodes):
```
1. Manual Trigger / Webhook
2. Discovery Agent (Find Papers)
3. Select Best Paper
4. Technical Analysis Agent
5. Market Analysis Agent
6. Competitive Analysis Agent
7. IP Analysis Agent
8. Calculate CVS Score
9. Format & Send Email Report ← Currently ends here
```

### What We're Adding (5 nodes):
```
10. Prepare Supabase Insert Data (Function)
    ↓
11. Insert Research Paper (Supabase)
    ↓
12. Insert CVS Analysis (Supabase)
    ↓
13. Get User Profile (Supabase)
    ↓
14. Update Analysis with User (Supabase)
    ↓
15. Log Success (Function)
```

### Database Tables Affected:

**research_papers** (1 new row per analysis)
- Stores selected research paper
- Fields: title, authors, abstract, citations, TRL, stage, industry
- Returns: `paper_id` (UUID)

**cvs_analyses** (1 new row per analysis)
- Stores CVS analysis results
- Fields: cvs_score, TAM, TRL, technical/market/competitive/IP scores
- Linked to: `research_papers` (via paper_id), `profiles` (via analyzed_by)

**profiles** (queried, not modified)
- Find user by email
- Returns: `user_id` (UUID)

---

## 🔄 Data Flow

```
n8n Workflow Input
{
  query: "AI for drug discovery",
  domain: "Healthcare",
  user_email: "demo+investor_ai@gmail.com"
}
    ↓
[Discovery → Analysis Agents → CVS Calculation]
    ↓
Node 1: Prepare Data
    • Generate opportunity_id: R2M-20251216-042
    • Map TRL → stage (Concept/Prototype/Pilot/Market-Ready)
    • Build paper_data object
    • Build analysis_data object
    ↓
Node 2: Insert Research Paper
    • INSERT into research_papers
    • Returns: paper_id = "abc-123"
    ↓
Node 3: Insert CVS Analysis
    • INSERT into cvs_analyses
    • Link via paper_id
    • Returns: analysis_id = "def-456"
    ↓
Node 4A: Get User Profile
    • SELECT from profiles WHERE email = ...
    • Returns: user_id = "ghi-789"
    ↓
Node 4B: Update Analysis
    • UPDATE cvs_analyses
    • SET analyzed_by = user_id, uploaded_by = user_id
    ↓
Node 5: Log Success
    • Console.log all IDs
    • Return success object
```

---

## 📊 Key Implementation Details

### 1. Opportunity ID Generation
```javascript
const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
const opportunityId = `R2M-${dateStr}-${randomSuffix}`;
// Example: R2M-20251216-042
```

### 2. TRL to Stage Mapping
```javascript
let stage = 'Concept';     // TRL 1-3
if (trl >= 9) stage = 'Market-Ready';  // TRL 9
else if (trl >= 7) stage = 'Pilot';    // TRL 7-8
else if (trl >= 4) stage = 'Prototype'; // TRL 4-6
```

### 3. Risk Score Calculation
```javascript
const risk_score = technicalData.risk_level === 'high' ? 8
                 : technicalData.risk_level === 'medium' ? 5
                 : 3;
```

### 4. Node Expression References
```javascript
// Access previous node data
$('Node Name').first().json.field_name

// Examples:
$('Prepare Supabase Insert Data').first().json.paper_data
$('Insert Research Paper').first().json.id
$('Get User Profile').first().json.id
```

---

## ✅ Success Criteria

### In n8n:
- [ ] All 5 new nodes execute without errors (green checkmarks)
- [ ] "Log Success" console output shows all IDs
- [ ] Workflow completes in <60 seconds

### In Supabase:
- [ ] `research_papers` table has 1 new row
- [ ] `cvs_analyses` table has 1 new row
- [ ] `paper_id` matches between tables
- [ ] `analyzed_by` is not null
- [ ] `cvs_score` is 0-100 (not null)

### Data Quality:
- [ ] Title is not empty
- [ ] Authors array is populated
- [ ] CVS score is reasonable (0-100)
- [ ] TAM is a number (not null)
- [ ] TRL is 1-9
- [ ] Stage is one of: Concept/Prototype/Pilot/Market-Ready
- [ ] Summary exists and is not empty

---

## 🧪 Testing Plan

### Phase 1: Individual Node Testing (30 min)
1. Add Node 1 (Prepare Data) → Execute → Verify output
2. Add Node 2 (Insert Paper) → Execute → Check Supabase
3. Add Node 3 (Insert Analysis) → Execute → Check Supabase
4. Add Nodes 4A & 4B (User linkage) → Execute → Verify update
5. Add Node 5 (Log) → Execute → Check console

### Phase 2: End-to-End Testing (15 min)
1. Execute full workflow with test query
2. Verify all nodes green
3. Check Supabase for 2 new rows
4. Verify foreign key relationships

### Phase 3: Data Quality Verification (15 min)
1. Run SQL queries to check data completeness
2. Verify all required fields populated
3. Check JSONB structure in analysis_notes
4. Confirm no null values in NOT NULL columns

### Test Input:
```json
{
  "query": "quantum computing for drug discovery",
  "domain": "Healthcare",
  "user_email": "YOUR_EMAIL+investor_ai@gmail.com"
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot read property 'json' of undefined"
**Cause:** Previous node didn't return expected data
**Fix:**
1. Check previous node succeeded (green checkmark)
2. Verify "Return Fields" is checked in Supabase nodes
3. Click previous node → Output tab → Verify structure

### Issue 2: Foreign Key Constraint Violation
**Cause:** paper_id or user_id doesn't exist
**Fix:**
1. Verify Node 2 (Insert Paper) succeeded
2. Check user exists:
   ```sql
   SELECT id FROM profiles WHERE email = 'YOUR_EMAIL+investor_ai@gmail.com';
   ```
3. If no user, run seed script: `seed_investors_YOUR_EMAIL.sql`

### Issue 3: Authentication Failed
**Cause:** Wrong Supabase credential
**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy **service_role** key (NOT anon key)
3. Update n8n credential

### Issue 4: Column Does Not Exist
**Cause:** Database migration not run
**Fix:**
1. Check migrations ran:
   ```sql
   SELECT * FROM _supabase_migrations;
   ```
2. If missing, run:
   - `009_add_researcher_connections.sql`
   - `010_add_profile_jsonb_column.sql`

### Issue 5: Workflow Times Out
**Cause:** Long-running analysis (30+ seconds)
**Fix:**
1. n8n → Settings → Executions → Timeout → Set to 120s
2. Or run in background mode

---

## 📈 Next Steps After Implementation

### Immediate (After n8n works):
1. **Verify database entries:**
   ```sql
   SELECT COUNT(*) FROM research_papers;
   SELECT COUNT(*) FROM cvs_analyses;
   ```

2. **Test marketplace integration:**
   - Update `src/app/marketplace/page.tsx`
   - Replace mockOpportunities with Supabase query
   - Verify real data displays

### Short-term (This week):
3. **Add introduction requests:**
   - Connect "Request Introduction" button
   - Save to `introduction_requests` table

4. **Test full user flow:**
   - Investor searches marketplace
   - Views opportunity details
   - Requests introduction
   - Innovator sees request in dashboard

### Medium-term (Next sprint):
5. **Implement investor matching:**
   - Match opportunities to investor preferences
   - Send email notifications for high matches

6. **Add analytics:**
   - Track opportunity views
   - Log introduction request conversions

---

## 📁 File Locations

All documentation saved in:
```
/Users/.../sprint4/r2m-marketplace/docs/implementation/
├── N8N_INTEGRATION_CHECKLIST.md       ← Step-by-step guide
├── N8N_NODE_CODE_SNIPPETS.md          ← Copy/paste code
├── N8N_WORKFLOW_DIAGRAM.md            ← Visual diagrams
├── N8N_QUICK_REFERENCE.md             ← Quick lookup
├── N8N_SUPABASE_INTEGRATION_GUIDE.md  ← Data mapping (existing)
└── N8N_IMPLEMENTATION_SUMMARY.md      ← This file
```

---

## 🎓 Learning Resources

### Understanding the Stack:
- **n8n workflows:** https://docs.n8n.io/workflows/
- **Supabase PostgreSQL:** https://supabase.com/docs/guides/database
- **JSONB in PostgreSQL:** https://www.postgresql.org/docs/current/datatype-json.html
- **Foreign Keys:** https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK

### Troubleshooting:
- **n8n expressions:** https://docs.n8n.io/code-examples/expressions/
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL errors:** https://www.postgresql.org/docs/current/errcodes-appendix.html

---

## 💡 Pro Tips

1. **Test incrementally:** Add one node at a time, test, then proceed
2. **Use Expression Editor:** Click fx icon to build expressions with autocomplete
3. **Save frequently:** n8n auto-saves, but manually save after major changes
4. **Console.log is your friend:** Add logging in Function nodes for debugging
5. **Name nodes descriptively:** Exact names matter for expression references
6. **Check Return Fields:** Critical for getting IDs from INSERT operations
7. **Verify before updating:** Always test GET before UPDATE operations

---

## 🚀 Ready to Implement?

### Prerequisites:
- [ ] n8n workflow `00 - Orchestrator Agent_emailFixed` accessible
- [ ] Supabase credentials available
- [ ] Migrations 009 & 010 run
- [ ] Test user account exists in profiles table
- [ ] 1.5-2 hours of uninterrupted time available

### Recommended Approach:
1. **Print N8N_QUICK_REFERENCE.md** for desk reference
2. **Open N8N_NODE_CODE_SNIPPETS.md** in browser
3. **Follow N8N_INTEGRATION_CHECKLIST.md** step-by-step
4. **Test each node individually** before proceeding
5. **Verify in Supabase** after each INSERT/UPDATE

---

## 📞 Support

If stuck:
1. Check **N8N_QUICK_REFERENCE.md** → Common Errors section
2. Review **N8N_WORKFLOW_DIAGRAM.md** → Troubleshooting flow
3. Verify database schema matches migration files
4. Check n8n console for detailed error messages

---

**Last Updated:** December 16, 2025
**Status:** Ready for implementation 🚀
**Estimated Time:** 1.5-2 hours
**Difficulty:** Intermediate
**Reward:** Real CVS data powering your R2M marketplace! 🎉

---

## ✨ What This Unlocks

**Before integration:**
- ❌ n8n analysis results only sent via email
- ❌ Marketplace shows 6 hardcoded opportunities
- ❌ No way to publish analyses
- ❌ No investor matching possible

**After integration:**
- ✅ Analyses automatically save to database
- ✅ Marketplace displays real opportunities
- ✅ Users can publish/unpublish listings
- ✅ Foundation for investor matching
- ✅ Introduction requests can be tracked
- ✅ Analytics on opportunity performance
- ✅ Deal pipeline becomes functional

**This is Step 1 Part B of the Smart Curator workflow - the foundation for everything else!**
