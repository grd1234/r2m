# n8n Workflow Visual Diagram
**Complete Orchestrator with Supabase Integration**

---

## Full Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                 EXISTING N8N ORCHESTRATOR WORKFLOW               │
│                    (DO NOT MODIFY THESE NODES)                   │
└─────────────────────────────────────────────────────────────────┘

[START] Manual Trigger / Webhook
   │
   │ Input: { query, domain, user_email }
   │
   ▼
┌──────────────────────────────────┐
│  Discovery Agent                 │  ← Find relevant papers
│  (Find Papers)                   │
└──────────────┬───────────────────┘
               │
               │ Output: Array of papers
               ▼
┌──────────────────────────────────┐
│  Select Best Paper for           │  ← Choose best paper for analysis
│  MarketAnalysis                  │
└──────────────┬───────────────────┘
               │
               │ Selected paper data
               │
               ├─────────────┬──────────────┬──────────────┐
               │             │              │              │
               ▼             ▼              ▼              ▼
       ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
       │Technical  │  │Market     │  │Competitive│  │IP         │
       │Analysis   │  │Analysis   │  │Analysis   │  │Analysis   │
       │Agent      │  │Agent      │  │Agent      │  │Agent      │
       └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
             │              │              │              │
             └──────┬───────┴──────┬───────┴──────────────┘
                    │              │
                    ▼              ▼
            ┌──────────────────────────────┐
            │ Calculate Commercial         │  ← Compute CVS score
            │ Viability Score              │
            └──────────────┬───────────────┘
                           │
                           │ CVS data: { commercial_viability_score, score_breakdown, ... }
                           ▼
                  ┌────────────────────┐
                  │ Format Email       │  ← Create email template
                  │ Report             │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Send Email Report  │  ← Email CVS results
                  └──────────┬─────────┘
                             │
                             │
╔════════════════════════════╧════════════════════════════════════╗
║                    NEW NODES TO ADD (5 NODES)                   ║
║                   SUPABASE INTEGRATION LAYER                    ║
╚═════════════════════════════════════════════════════════════════╝
                             │
                             ▼
        ┌────────────────────────────────────────────┐
        │ 🔧 NODE 1: Prepare Supabase Insert Data   │  ← FUNCTION
        ├────────────────────────────────────────────┤
        │  Type: Function (JavaScript)               │
        │  Purpose: Transform n8n data → Supabase   │
        │                                            │
        │  Inputs:                                   │
        │    • selectedPaper (from Select Best)     │
        │    • technicalData (from Technical Agent) │
        │    • marketData (from Market Agent)       │
        │    • competitiveData (from Comp Agent)    │
        │    • ipData (from IP Agent)               │
        │    • cvsData (from Calculate CVS)         │
        │                                            │
        │  Processing:                               │
        │    1. Generate opportunity_id             │
        │       → R2M-20251216-042                  │
        │    2. Map TRL → stage                     │
        │       → Concept/Prototype/Pilot/Market    │
        │    3. Build paper_data object             │
        │    4. Build analysis_data object          │
        │                                            │
        │  Outputs:                                  │
        │    {                                       │
        │      user_email: "...",                   │
        │      opportunity_id: "R2M-...",           │
        │      paper_data: { ... },                 │
        │      analysis_data: { ... }               │
        │    }                                       │
        └────────────────┬───────────────────────────┘
                         │
                         │ paper_data + analysis_data
                         ▼
        ┌────────────────────────────────────────────┐
        │ 📝 NODE 2: Insert Research Paper          │  ← SUPABASE
        ├────────────────────────────────────────────┤
        │  Type: Supabase                            │
        │  Operation: INSERT                         │
        │  Table: research_papers                    │
        │                                            │
        │  Data:                                     │
        │    {{ $json.paper_data }}                 │
        │                                            │
        │  Fields Inserted:                          │
        │    • title                                 │
        │    • authors (JSONB array)                │
        │    • abstract                              │
        │    • publication_date                     │
        │    • citation_count                       │
        │    • external_id                          │
        │    • source                                │
        │    • tech_category                        │
        │    • industry                              │
        │    • stage                                 │
        │    • is_published_to_marketplace: true    │
        │                                            │
        │  ⚠️ IMPORTANT:                             │
        │    ✓ Check "Return Fields"                │
        │    ✓ Select "id" field                    │
        │                                            │
        │  Returns:                                  │
        │    { "id": "uuid-of-paper" }              │
        └────────────────┬───────────────────────────┘
                         │
                         │ paper_id (UUID)
                         ▼
        ┌────────────────────────────────────────────┐
        │ 📊 NODE 3: Insert CVS Analysis            │  ← SUPABASE
        ├────────────────────────────────────────────┤
        │  Type: Supabase                            │
        │  Operation: INSERT                         │
        │  Table: cvs_analyses                       │
        │                                            │
        │  Data (Expression mode):                   │
        │    {                                       │
        │      ...analysis_data,                    │
        │      paper_id: (from Node 2)              │
        │    }                                       │
        │                                            │
        │  Fields Inserted:                          │
        │    • paper_id (FK → research_papers.id)   │
        │    • title, query                         │
        │    • cvs_score (0-100)                    │
        │    • technical_score (0-40)               │
        │    • market_score (0-45)                  │
        │    • competitive_score (0-15)             │
        │    • ip_score (0-10)                      │
        │    • risk_score (1-10)                    │
        │    • tam (Total Addressable Market in $B) │
        │    • trl (1-9)                            │
        │    • target_industry                      │
        │    • summary                               │
        │    • recommendations                      │
        │    • key_strengths (JSONB array)          │
        │    • key_risks (JSONB array)              │
        │    • go_to_market_strategy                │
        │    • status: 'completed'                  │
        │    • is_ai_generated: true                │
        │    • analysis_notes (full JSON blob)      │
        │                                            │
        │  ⚠️ IMPORTANT:                             │
        │    ✓ Check "Return Fields"                │
        │    ✓ Select "id" field                    │
        │                                            │
        │  Returns:                                  │
        │    { "id": "uuid-of-analysis" }           │
        └────────────────┬───────────────────────────┘
                         │
                         │ analysis_id (UUID)
                         ▼
        ┌────────────────────────────────────────────┐
        │ 👤 NODE 4A: Get User Profile              │  ← SUPABASE
        ├────────────────────────────────────────────┤
        │  Type: Supabase                            │
        │  Operation: GET                            │
        │  Table: profiles                           │
        │                                            │
        │  Filter:                                   │
        │    email = {{ user_email }}               │
        │                                            │
        │  Returns:                                  │
        │    { "id": "uuid-of-user" }               │
        └────────────────┬───────────────────────────┘
                         │
                         │ user_id (UUID)
                         ▼
        ┌────────────────────────────────────────────┐
        │ 👤 NODE 4B: Update Analysis with User     │  ← SUPABASE
        ├────────────────────────────────────────────┤
        │  Type: Supabase                            │
        │  Operation: UPDATE                         │
        │  Table: cvs_analyses                       │
        │                                            │
        │  Filter:                                   │
        │    id = {{ analysis_id from Node 3 }}     │
        │                                            │
        │  Update Data:                              │
        │    {                                       │
        │      "analyzed_by": {{ user_id }},        │
        │      "uploaded_by": {{ user_id }}         │
        │    }                                       │
        │                                            │
        │  Returns:                                  │
        │    { "id": "uuid-of-updated-analysis" }   │
        └────────────────┬───────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────┐
        │ ✅ NODE 5: Log Success                    │  ← FUNCTION
        ├────────────────────────────────────────────┤
        │  Type: Function (JavaScript)               │
        │  Purpose: Confirm + log details            │
        │                                            │
        │  Inputs:                                   │
        │    • analysis_id (from Node 3)            │
        │    • paper_id (from Node 2)               │
        │    • opportunity_id (from Node 1)         │
        │    • cvs_score (from Node 1)              │
        │    • user_id (from Node 4A)               │
        │                                            │
        │  Console Output:                           │
        │    ✅ CVS Analysis saved to Supabase!     │
        │    Analysis ID: abc-123-...               │
        │    Paper ID: def-456-...                  │
        │    Opportunity ID: R2M-20251216-042       │
        │    CVS Score: 85                          │
        │    User ID: ghi-789-...                   │
        │                                            │
        │  Returns:                                  │
        │    {                                       │
        │      success: true,                       │
        │      analysis_id: "...",                  │
        │      paper_id: "...",                     │
        │      opportunity_id: "...",               │
        │      cvs_score: 85,                       │
        │      user_id: "...",                      │
        │      message: "Success!",                 │
        │      timestamp: "2025-12-16T..."          │
        │    }                                       │
        └────────────────┬───────────────────────────┘
                         │
                         ▼
                      [END]
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    N8N WORKFLOW DATA FLOW                        │
└─────────────────────────────────────────────────────────────────┘

INPUT
{
  query: "AI for drug discovery",
  domain: "Healthcare",
  user_email: "demo+investor_ai@gmail.com"
}
   │
   ▼
DISCOVERY AGENT
   │ finds 10 papers
   ▼
SELECT BEST PAPER
   │ selectedPaper: {
   │   title: "Attention Is All You Need",
   │   authors: ["Vaswani", "Shazeer"],
   │   citations: 50000,
   │   trl_level: 6
   │ }
   │
   ├───────────┬───────────┬───────────┐
   │           │           │           │
   ▼           ▼           ▼           ▼
TECHNICAL   MARKET   COMPETITIVE   IP
   │           │           │           │
   └───────┬───┴───┬───────┴───────────┘
           │       │
           ▼       ▼
       CALCULATE CVS
           │ cvsData: {
           │   commercial_viability_score: 85,
           │   score_breakdown: {...}
           │ }
           ▼
       FORMAT EMAIL
           │
           ▼
       SEND EMAIL
           │
           │
╔══════════╧═══════════════════════════════════════════╗
║         NEW SUPABASE INTEGRATION LAYER                ║
╚═══════════════════════════════════════════════════════╝
           │
           ▼
    ┌──────────────┐
    │ PREPARE DATA │  (Node 1)
    └──────┬───────┘
           │ paper_data: {
           │   title: "Attention Is All You Need",
           │   authors: ["Vaswani", "Shazeer"],
           │   stage: "Prototype",  ← TRL 6 mapped
           │   ...
           │ }
           │ analysis_data: {
           │   cvs_score: 85,
           │   tam: 50,
           │   trl: 6,
           │   ...
           │ }
           ▼
    ┌──────────────────┐
    │ INSERT PAPER     │  (Node 2)
    │ → research_papers│
    └──────┬───────────┘
           │ returns: paper_id = "abc-123"
           ▼
    ┌──────────────────┐
    │ INSERT ANALYSIS  │  (Node 3)
    │ → cvs_analyses   │
    │   paper_id: abc  │  ← Links to paper
    └──────┬───────────┘
           │ returns: analysis_id = "def-456"
           ▼
    ┌──────────────────┐
    │ GET USER         │  (Node 4A)
    │ → profiles       │
    │   email: ...     │
    └──────┬───────────┘
           │ returns: user_id = "ghi-789"
           ▼
    ┌──────────────────┐
    │ UPDATE ANALYSIS  │  (Node 4B)
    │ → cvs_analyses   │
    │   analyzed_by:   │  ← Links to user
    │   ghi-789        │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ LOG SUCCESS  │  (Node 5)
    └──────────────┘

RESULT IN SUPABASE:
┌──────────────────────────────────────┐
│ research_papers                      │
├──────────────────────────────────────┤
│ id: abc-123                          │
│ title: "Attention Is All You Need"  │
│ stage: "Prototype"                  │
│ is_published: true                  │
└──────────────────────────────────────┘
          ↑
          │ paper_id
          │
┌──────────────────────────────────────┐
│ cvs_analyses                         │
├──────────────────────────────────────┤
│ id: def-456                          │
│ paper_id: abc-123  ← FK              │
│ analyzed_by: ghi-789  ← FK           │
│ cvs_score: 85                        │
│ tam: 50                              │
│ status: 'completed'                 │
└──────────────────────────────────────┘
          ↑
          │ analyzed_by
          │
┌──────────────────────────────────────┐
│ profiles                             │
├──────────────────────────────────────┤
│ id: ghi-789                          │
│ email: "demo+investor_ai@gmail.com" │
│ user_type: "investor"               │
└──────────────────────────────────────┘
```

---

## Node Connections (Linear Flow)

```
Send Email Report
      ↓
      ↓ Connect to
      ↓
Prepare Supabase Insert Data (Function)
      ↓
      ↓ Connect to
      ↓
Insert Research Paper (Supabase)
      ↓
      ↓ Connect to
      ↓
Insert CVS Analysis (Supabase)
      ↓
      ↓ Connect to
      ↓
Get User Profile (Supabase)
      ↓
      ↓ Connect to
      ↓
Update Analysis with User (Supabase)
      ↓
      ↓ Connect to
      ↓
Log Success (Function)
      ↓
     END
```

**Total new connections:** 6 (one between each node pair)

---

## Database Schema Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE TABLES                              │
└─────────────────────────────────────────────────────────────────┘

auth.users (Managed by Supabase)
└─ id (UUID, PK)
   └─ email
      └─ encrypted_password

          ↑
          │ profiles.id → auth.users.id (FK)
          │
profiles
├─ id (UUID, PK, FK → auth.users.id)
├─ email (text)
├─ full_name (text)
├─ user_type (enum: 'investor' | 'startup' | 'researcher')
├─ company_name (text)
├─ role (text)
└─ profile (JSONB)
   └─ {
        "domains": ["AI/ML", "Healthcare"],
        "min_cvs_threshold": 60,
        ...
      }

          ↑                                    ↑
          │ uploaded_by                        │ analyzed_by
          │                                    │
research_papers                                │
├─ id (UUID, PK) ──────────────────────┐      │
├─ uploaded_by (UUID, FK → profiles)   │      │
├─ title (text)                         │      │
├─ authors (JSONB array)                │      │
├─ abstract (text)                      │      │
├─ stage (enum)                         │      │
└─ is_published_to_marketplace (bool)   │      │
                                        │      │
                                        │ paper_id
                                        │      │
                                        ▼      │
                               cvs_analyses    │
                               ├─ id (UUID, PK)│
                               ├─ paper_id ────┘
                               ├─ analyzed_by ─────┘
                               ├─ cvs_score (0-100)
                               ├─ tam (numeric)
                               ├─ trl (1-9)
                               ├─ status (enum)
                               └─ analysis_notes (JSONB)
```

---

## Expression Reference Guide

### Accessing Previous Node Data

```javascript
// Format: $('Node Name').first().json.field_name

// Get selected paper
$('Select Best Paper for MarketAnalysis').first().json.title

// Get technical analysis TRL
$('Technical Analysis Agent').first().json.trl_level

// Get CVS score
$('Calculate Commercial Viability Score').first().json.commercial_viability_score

// Get paper ID from Insert Paper node
$('Insert Research Paper').first().json.id

// Get analysis ID from Insert Analysis node
$('Insert CVS Analysis').first().json.id

// Get user ID from Get User Profile node
$('Get User Profile').first().json.id
```

### Special Cases

```javascript
// Access nested fields
marketData.market_size_estimate?.tam_billions

// Access array elements
marketData.target_industries?.[0]

// Conditional defaults
selectedPaper.title || 'Untitled Research'

// Spread operator (merge objects)
{
  ...analysis_data,
  paper_id: '...'
}
```

---

## Success Indicators

### In n8n UI:
```
✅ All 5 new nodes show green checkmarks
✅ No red error nodes
✅ "Log Success" console shows:
   ✅ CVS Analysis saved to Supabase!
   Analysis ID: def-456-...
   Paper ID: abc-123-...
   Opportunity ID: R2M-20251216-042
   CVS Score: 85
```

### In Supabase:
```sql
-- Check research_papers
SELECT COUNT(*) FROM research_papers;
-- Expected: 1 new row

-- Check cvs_analyses
SELECT COUNT(*) FROM cvs_analyses;
-- Expected: 1 new row

-- Verify linkage
SELECT
  p.title,
  c.cvs_score,
  c.paper_id,
  c.analyzed_by
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
ORDER BY c.created_at DESC
LIMIT 1;
-- Expected: 1 row with matching IDs
```

### In Marketplace UI:
```
After connecting UI to database:
✅ Real opportunities display (not mock data)
✅ CVS scores match n8n output
✅ TAM and TRL visible
✅ Can click to view full analysis
```

---

## Troubleshooting Flow

```
Problem: Node turns red ❌
   │
   ├─ Check error message
   │   │
   │   ├─ "Cannot read property..."
   │   │   └─→ Previous node failed
   │   │       └─→ Check "Return Fields" checked
   │   │
   │   ├─ "Foreign key violation"
   │   │   └─→ paper_id or user_id doesn't exist
   │   │       └─→ Verify INSERT succeeded
   │   │
   │   ├─ "Authentication failed"
   │   │   └─→ Wrong Supabase credential
   │   │       └─→ Check service_role key
   │   │
   │   └─ "Column does not exist"
   │       └─→ Migration not run
   │           └─→ Run 009 & 010 migrations
   │
   └─ Check n8n console for logs
       └─→ Look for console.log output
           └─→ Verify data structure
```

---

**Ready to implement?** Use this diagram alongside the code snippets! 🚀
