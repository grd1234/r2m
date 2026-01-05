# n8n → Supabase Visual Node Guide
**Quick Reference: 5 Nodes to Add**

---

## 📊 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING n8n WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

[START] User Query Input
    ↓
[1] Discovery Agent (Find Papers)
    ↓
[2] Select Best Paper for MarketAnalysis
    ↓
[3] Technical Analysis Agent ─────┐
    ↓                             │
[4] Market Analysis Agent ────────┤
    ↓                             │
[5] Competitive Analysis Agent ───┤  (Run in parallel)
    ↓                             │
[6] IP Analysis Agent ────────────┘
    ↓
[7] Calculate Commercial Viability Score
    ↓
[8] Format Email Report
    ↓
[9] Send Email Report
    ↓
┌─────────────────────────────────────────────────────────────────┐
│              ⚡ NEW NODES TO ADD (5 nodes)                       │
└─────────────────────────────────────────────────────────────────┘
    ↓
[10] 🔧 Prepare Supabase Insert Data (Function)
    ↓
[11] 📝 Insert Research Paper (Supabase)
    ↓
[12] 📊 Insert CVS Analysis (Supabase)
    ↓
[13] 👤 Link to User Profile (Supabase)
    ↓
[14] ✅ Log Success (Function)
    ↓
[END] Complete!
```

---

## 🔧 Node 1: Prepare Supabase Insert Data

**Type**: Function (JavaScript)
**Position**: After "Send Email Report"
**Purpose**: Transform n8n data → Supabase format

```
┌────────────────────────────────────────────────────┐
│  Prepare Supabase Insert Data                     │
├────────────────────────────────────────────────────┤
│  Input:                                            │
│    • selectedPaper (from Select Best Paper)       │
│    • technicalData (from Technical Agent)         │
│    • marketData (from Market Agent)               │
│    • competitiveData (from Competitive Agent)     │
│    • ipData (from IP Agent)                       │
│    • cvsData (from Calculate CVS Score)           │
│                                                    │
│  Output:                                           │
│    {                                               │
│      "opportunity_id": "R2M-20251215-042",        │
│      "paper_data": { ... },                       │
│      "analysis_data": { ... }                     │
│    }                                               │
└────────────────────────────────────────────────────┘
```

**Key Logic**:
- Generate unique opportunity ID: `R2M-[DATE]-[RANDOM]`
- Map TRL → Stage (Concept, Prototype, Pilot, Market-Ready)
- Extract all scores from different agents
- Package into 2 objects: `paper_data` + `analysis_data`

---

## 📝 Node 2: Insert Research Paper

**Type**: Supabase
**Position**: After "Prepare Supabase Insert Data"
**Purpose**: Save paper to `research_papers` table

```
┌────────────────────────────────────────────────────┐
│  Insert Research Paper                             │
├────────────────────────────────────────────────────┤
│  Operation: INSERT                                 │
│  Table: research_papers                            │
│                                                    │
│  Data:                                             │
│    {{ $json.paper_data }}                         │
│                                                    │
│  Inserts:                                          │
│    • title                                         │
│    • authors (JSONB array)                        │
│    • abstract                                      │
│    • publication_date                             │
│    • citation_count                               │
│    • external_id (arXiv/DOI)                      │
│    • source (semantic_scholar/arxiv)              │
│    • tech_category (AI/ML, Healthcare, etc.)      │
│    • industry                                      │
│    • stage (Concept/Prototype/Pilot/Market)       │
│                                                    │
│  Returns: { "id": "paper-uuid-here" }             │
└────────────────────────────────────────────────────┘
```

**⚠️ Important**: Check "Return Fields" → Select `id`

This UUID is needed for the next node!

---

## 📊 Node 3: Insert CVS Analysis

**Type**: Supabase
**Position**: After "Insert Research Paper"
**Purpose**: Save CVS analysis to `cvs_analyses` table

```
┌────────────────────────────────────────────────────┐
│  Insert CVS Analysis                               │
├────────────────────────────────────────────────────┤
│  Operation: INSERT                                 │
│  Table: cvs_analyses                               │
│                                                    │
│  Data:                                             │
│    {                                               │
│      ...{{ $("Prepare...").json.analysis_data }}, │
│      paper_id: {{ $("Insert Paper").json.id }}    │
│    }                                               │
│                                                    │
│  Inserts:                                          │
│    • paper_id ← From Node 2                       │
│    • title, query                                 │
│    • cvs_score (0-100)                            │
│    • technical_score (0-40)                       │
│    • market_score (0-45)                          │
│    • competitive_score (0-15)                     │
│    • ip_score (0-10)                              │
│    • risk_score (1-10)                            │
│    • tam (Total Addressable Market in $B)         │
│    • trl (1-9)                                    │
│    • target_industry                              │
│    • summary                                       │
│    • recommendations                              │
│    • key_strengths (JSONB array)                  │
│    • key_risks (JSONB array)                      │
│    • go_to_market_strategy                        │
│    • status: 'completed'                          │
│    • is_ai_generated: true                        │
│    • analysis_notes (full JSON blob)              │
│                                                    │
│  Returns: { "id": "analysis-uuid-here" }          │
└────────────────────────────────────────────────────┘
```

**⚠️ Important**: Also return `id` field for next node!

---

## 👤 Node 4: Link to User Profile

**Type**: Supabase (Get) + Supabase (Update)
**Position**: After "Insert CVS Analysis"
**Purpose**: Connect analysis to user who requested it

### Option A: With User Email

```
┌────────────────────────────────────────────────────┐
│  Get User Profile (by email)                      │
├────────────────────────────────────────────────────┤
│  Operation: GET                                    │
│  Table: profiles                                   │
│  Filter: email = {{ $("Prepare...").json.user_email }} │
│  Returns: { "id": "user-uuid" }                   │
└────────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────────┐
│  Update Analysis with User                        │
├────────────────────────────────────────────────────┤
│  Operation: UPDATE                                 │
│  Table: cvs_analyses                               │
│  Filter: id = {{ $("Insert CVS...").json.id }}    │
│  Update:                                           │
│    {                                               │
│      "analyzed_by": {{ $("Get User...").json.id }}, │
│      "uploaded_by": {{ $("Get User...").json.id }} │
│    }                                               │
└────────────────────────────────────────────────────┘
```

### Option B: Without User Email (Demo User)

```
┌────────────────────────────────────────────────────┐
│  Set Demo User ID (hardcoded)                     │
├────────────────────────────────────────────────────┤
│  Type: Set                                         │
│  Field: demo_user_id                              │
│  Value: [UUID from Supabase profiles table]       │
│                                                    │
│  Use this UUID in Update node above               │
└────────────────────────────────────────────────────┘
```

**To get demo user UUID**:
```sql
-- Run in Supabase SQL Editor
SELECT id FROM profiles
WHERE email LIKE '%investor_ai%'
LIMIT 1;
```

---

## ✅ Node 5: Log Success

**Type**: Function (JavaScript)
**Position**: After "Link to User Profile"
**Purpose**: Confirm success & log details

```
┌────────────────────────────────────────────────────┐
│  Log Success                                       │
├────────────────────────────────────────────────────┤
│  Input:                                            │
│    • Analysis ID (from Node 3)                    │
│    • Opportunity ID (from Node 1)                 │
│    • CVS Score (from Node 1)                      │
│                                                    │
│  Output:                                           │
│    {                                               │
│      "success": true,                             │
│      "analysis_id": "...",                        │
│      "opportunity_id": "R2M-20251215-042",        │
│      "cvs_score": 85,                             │
│      "message": "Successfully saved to database"  │
│    }                                               │
│                                                    │
│  Console Output:                                   │
│    ✅ CVS Analysis saved to Supabase!             │
│    Analysis ID: abc-123                           │
│    Opportunity ID: R2M-20251215-042               │
│    CVS Score: 85                                  │
└────────────────────────────────────────────────────┘
```

**This node is optional but helpful for debugging!**

---

## 🎯 Data Flow Summary

```
┌─────────────────┐
│  n8n Workflow   │
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │ Paper Data:  │
  │ • Title      │
  │ • Authors    │
  │ • Abstract   │
  │ • Citations  │
  └──────┬───────┘
         │
         ▼
  ┌──────────────────────┐
  │ research_papers      │  ← Supabase Table
  │ (1 row inserted)     │
  └──────┬───────────────┘
         │ returns paper_id
         ▼
  ┌──────────────┐
  │ CVS Data:    │
  │ • CVS Score  │
  │ • TAM        │
  │ • TRL        │
  │ • Scores     │
  │ • Summary    │
  └──────┬───────┘
         │ + paper_id
         ▼
  ┌──────────────────────┐
  │ cvs_analyses         │  ← Supabase Table
  │ (1 row inserted)     │
  └──────┬───────────────┘
         │ returns analysis_id
         ▼
  ┌──────────────┐
  │ User Profile │
  │ (lookup)     │
  └──────┬───────┘
         │ returns user_id
         ▼
  ┌──────────────────────┐
  │ cvs_analyses         │  ← Update
  │ analyzed_by = user   │
  └──────────────────────┘
```

---

## 🔑 Important Configuration Details

### Supabase Credential Setup

```
Name: R2M Supabase
Type: Supabase
Host: https://vqgwzzzjlswyagncyhih.supabase.co
Service Role: [Get from Supabase → Settings → API]
```

**⚠️ Use Service Role Key**, not Anon Key!
- Service Role bypasses RLS policies
- Required for n8n to insert data

### Expression Mode vs. JSON Mode

**When to use Expression mode**:
- Referencing data from previous nodes
- Using `{{ }}` syntax
- Example: `{{ $json.paper_data }}`

**When to use JSON mode**:
- Static values
- Fixed configuration
- Example: `{ "status": "completed" }`

### Node Naming Convention

Use descriptive names:
- ✅ "Prepare Supabase Insert Data"
- ✅ "Insert Research Paper"
- ❌ "Function 1"
- ❌ "Supabase"

Why? Easier to reference in expressions:
```javascript
{{ $("Prepare Supabase Insert Data").json.opportunity_id }}
```

---

## 📝 Testing Checklist

After adding all 5 nodes:

1. **Visual Check**:
   - [ ] All nodes connected (no gaps)
   - [ ] Node names are descriptive
   - [ ] Supabase credential selected

2. **Execute Test**:
   - [ ] Click "Execute Workflow" button
   - [ ] All nodes turn green ✅
   - [ ] No red error nodes ❌
   - [ ] "Log Success" shows success message

3. **Database Verification**:
   - [ ] Open Supabase → Table Editor
   - [ ] Check `research_papers` → New row exists
   - [ ] Check `cvs_analyses` → New row exists
   - [ ] CVS score is populated (not 0 or null)
   - [ ] `paper_id` matches between tables

4. **Data Quality Check**:
   - [ ] Title makes sense
   - [ ] CVS score is 0-100
   - [ ] TAM is reasonable number
   - [ ] TRL is 1-9
   - [ ] Summary is not empty
   - [ ] Recommendations exist

5. **User Linkage**:
   - [ ] `analyzed_by` is not null
   - [ ] Points to valid user UUID
   - [ ] Can join: `cvs_analyses → profiles`

---

## 🚨 Common Errors & Solutions

### Error: "Table does not exist"
```
Solution: Run migrations 009 & 010 in Supabase
```

### Error: "Authentication failed"
```
Solution: Check service_role key in credential
```

### Error: "Cannot read property 'json' of undefined"
```
Solution: Previous node failed or didn't return data
Check that "Insert Research Paper" returned ID
```

### Error: "Foreign key constraint violation"
```
Solution: paper_id or user_id doesn't exist
1. Check "Insert Research Paper" succeeded
2. Check user exists in profiles table
```

### Error: "Null value in NOT NULL column"
```
Solution: Required field missing
Check cvs_score, title, or status are populated
```

---

## 🎓 Pro Tips

1. **Test incrementally**: Add 1 node at a time, test, then add next
2. **Use Execute Node**: Don't run full workflow until all nodes added
3. **Check previous node output**: Always verify data before passing to next node
4. **Console.log is your friend**: Add logging in Function nodes
5. **Save frequently**: n8n auto-saves, but click Save manually after major changes

---

## ✨ What Success Looks Like

**In n8n**:
```
✅ All 5 nodes green
✅ Console shows: "CVS Analysis saved to Supabase!"
✅ Analysis ID displayed
```

**In Supabase**:
```
✅ research_papers: 1 new row
✅ cvs_analyses: 1 new row
✅ Both rows linked by paper_id
✅ Analysis linked to user by analyzed_by
```

**In Marketplace** (after connecting UI):
```
✅ Real opportunities display (not mock data)
✅ CVS scores match n8n output
✅ TAM and TRL visible
✅ Can click to view full analysis
```

---

**Ready to implement?** Start with Step 1 in the checklist! 🚀

**Stuck?** Refer to:
- `N8N_INTEGRATION_CHECKLIST.md` - Step-by-step instructions
- `N8N_SUPABASE_INTEGRATION_GUIDE.md` - Detailed data mapping
- This visual guide - Quick reference

**Estimated time**: 1.5-2 hours
**Difficulty**: Intermediate
**Reward**: Real CVS data in your marketplace! 🎉
