# n8n → Supabase Integration Guide
## Step 1: Database Schema & Integration

**Created:** December 14, 2024
**Purpose:** Modify n8n orchestrator to POST CVS analysis results to Supabase database
**Target Workflow:** `00 - Orchestrator Agent_emailFixed`

---

## Overview

Currently, your n8n orchestrator:
1. Runs Discovery Agent → gets papers
2. Runs Technical Agent → analyzes papers
3. Runs Market Agent → analyzes market
4. Runs Competitive Agent → analyzes competition
5. Runs IP Agent → analyzes patents
6. Calculates CVS score
7. **Sends email report** ← Currently stops here

**What we need to add:**
8. **POST results to Supabase** (`cvs_analyses` + `research_papers` tables)
9. **Link opportunity to innovator** (via `user_email`)
10. **Generate unique opportunity_id** (format: `R2M-20241214-001`)

---

## Architecture: Mapping n8n Data → Supabase Tables

### Table 1: `research_papers` (Selected Paper)

**Purpose:** Store the research paper that was selected for commercialization

**Data Source:** From `Select Best Paper for MarketAnalysis` node

| Supabase Field | n8n Data Path | Example Value |
|----------------|---------------|---------------|
| `uploaded_by` | Match via `user_email` → `profiles.id` | `uuid-from-profiles-table` |
| `title` | `selected_paper.title` | "Attention Is All You Need" |
| `authors` | `selected_paper.authors` | `["Vaswani", "Shazeer"]` |
| `publication_date` | `selected_paper.year` OR null | 2017 |
| `citation_count` | `selected_paper.citations` | 50000 |
| `external_id` | `selected_paper.paper_id` | "arxiv:1706.03762" |
| `source` | `'arxiv'` OR `'semantic_scholar'` | "arxiv" |
| `is_published_to_marketplace` | `true` (always) | true |
| `tech_category` | `domain` | "AI/ML" |
| `industry` | `market_data.target_industries[0]` | "Healthcare" |
| `stage` | Based on `trl_level` | "Prototype" (TRL 4-6) |

**Stage Mapping:**
- TRL 1-3 → `"Concept"`
- TRL 4-6 → `"Prototype"`
- TRL 7-8 → `"Pilot"`
- TRL 9 → `"Market-Ready"`

---

### Table 2: `cvs_analyses` (CVS Analysis Results)

**Purpose:** Store the full CVS analysis with all scores and recommendations

**Data Source:** From `Calculate Commercial Viability Score` node

| Supabase Field | n8n Data Path | Example Value |
|----------------|---------------|---------------|
| `paper_id` | `paper_id` from `research_papers` insert | `uuid-of-paper` |
| `analyzed_by` | Match via `user_email` → `profiles.id` | `uuid-from-profiles-table` |
| `title` | `query` | "AI drug discovery commercial viability" |
| `query` | `query` | "AI drug discovery commercial viability" |
| `cvs_score` | `commercial_viability_score` | 85 |
| `technical_score` | `score_breakdown.technical.weighted_total` | 36 |
| `market_score` | `score_breakdown.market.weighted_total` | 41 |
| `commercial_score` | `score_breakdown.market.weighted_total` | 41 (same as market for now) |
| `competitive_score` | `score_breakdown.competitive.weighted_total` | 13 |
| `ip_score` | `ip_analysis.ip_opportunity_score` | 7 |
| `risk_score` | Based on `technical_data.risk_level` | 3-10 |
| `tam` | `market_data.market_size_estimate.tam_billions` | 50 |
| `trl` | `selected_paper.trl_level` | 6 |
| `target_industry` | `market_data.target_industries[0]` | "Healthcare" |
| `summary` | `market_data.executive_summary` | "Strong commercial potential..." |
| `recommendations` | `recommendation` | "Highly recommended for investment" |
| `key_strengths` | `selected_paper.competitive_advantages` | `["Novel architecture", "Scalable"]` |
| `key_risks` | `selected_paper.risk_factors` | `["Data requirements", "Compute cost"]` |
| `go_to_market_strategy` | `market_data.go_to_market_strategy` | "Partner with pharma companies..." |
| `status` | `'completed'` | "completed" |
| `is_ai_generated` | `true` | true |
| `analysis_notes` | Full JSON blob (see below) | `{...}` |

---

### `analysis_notes` JSONB Structure

Store the complete analysis for the full report view:

```json
{
  "technical_analysis": {
    "trl_level": 6,
    "trl_reasoning": "Proof of concept demonstrated...",
    "feasibility_score": 8,
    "commercial_potential": 9,
    "risk_level": "Medium",
    "risk_factors": ["Data requirements", "Compute cost"],
    "key_insights": ["Novel architecture", "Outperforms prior methods"],
    "limitations": ["Requires large datasets", "High compute cost"]
  },
  "market_analysis": {
    "market_size_estimate": {
      "tam_billions": 50,
      "sam_billions": 15,
      "som_millions": 500
    },
    "financial_projections": {
      "cagr_percent": 25,
      "year_1_revenue": 2000000,
      "year_3_revenue": 8000000,
      "year_5_revenue": 20000000
    },
    "market_readiness": {
      "readiness_score": 7,
      "barriers_to_adoption": ["Regulatory approval", "Data privacy concerns"]
    },
    "target_industries": ["Healthcare", "Pharmaceuticals"],
    "use_cases": ["Drug discovery", "Protein folding", "Clinical trials"]
  },
  "competitive_analysis": {
    "competitive_risk_score": 4,
    "competitive_landscape": {
      "key_competitors": ["OpenAI", "DeepMind", "Insilico Medicine"],
      "market_leaders": ["Google Health", "IBM Watson Health"]
    },
    "barriers_to_entry": [
      "Access to medical data",
      "FDA approval process",
      "Partnerships with pharma companies"
    ],
    "competitive_advantages": [
      "Novel transformer architecture",
      "State-of-the-art accuracy",
      "Scalable infrastructure"
    ]
  },
  "ip_analysis": {
    "ip_risk_score": 3,
    "ip_opportunity_score": 7,
    "patent_search_count": 15,
    "major_ip_holders": ["Google", "IBM", "Pfizer"],
    "white_space_opportunities": [
      "Transformer-based drug discovery",
      "Attention mechanisms for protein folding"
    ],
    "freedom_to_operate": "Medium - some existing patents, but white space available",
    "prior_art_analysis": "15 relevant patents found, but novel application area"
  },
  "selected_paper": {
    "paper_id": "arxiv:1706.03762",
    "title": "Attention Is All You Need",
    "authors": ["Vaswani", "Shazeer", "Parmar"],
    "year": 2017,
    "citations": 50000,
    "doi": "10.1234/arxiv.1706.03762",
    "pdf_url": "https://arxiv.org/pdf/1706.03762.pdf"
  }
}
```

---

## n8n Node Configuration

### Where to Add: After "Calculate Commercial Viability Score" Node

**Current flow:**
```
Calculate CVS → Format Email Report → Send Email
```

**New flow:**
```
Calculate CVS → POST to Supabase → Format Email Report → Send Email
                       ↓
              (branches to both)
```

---

### Node 1: Prepare Supabase Insert Data

**Node Type:** Code (JavaScript)
**Name:** `Prepare Supabase Insert Data`
**Position:** After `Calculate Commercial Viability Score`

**Purpose:** Transform n8n data into Supabase-compatible JSON

**JavaScript Code:**

```javascript
// Prepare data for Supabase insert
const cvsData = $input.first().json;

console.log('=== PREPARING SUPABASE INSERT ===');

// Extract core data
const technicalData = cvsData.technical_summary || {};
const marketData = cvsData.market_data || {};
const competitiveData = cvsData.competitive_data || {};
const ipData = cvsData.ip_analysis || {};
const selectedPaper = cvsData.selected_paper || {};

// Generate unique opportunity_id
const today = new Date();
const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
const opportunityId = `R2M-${dateStr}-${randomSuffix}`;

console.log('Generated opportunity_id:', opportunityId);

// Map TRL to stage
let stage = 'Concept';
const trl = selectedPaper.trl_level || technicalData.trl_level || 0;
if (trl >= 9) stage = 'Market-Ready';
else if (trl >= 7) stage = 'Pilot';
else if (trl >= 4) stage = 'Prototype';

// Map risk_level to risk_score (0-5 scale for CVS table)
const riskLevel = technicalData.risk_level || cvsData.risk_level || 'Medium';
const riskScore = riskLevel === 'Low' ? 5 : riskLevel === 'Medium' ? 3 : 1;

// Prepare research_papers insert
const paperInsert = {
  // Will be set to profile.id via lookup
  uploaded_by: null,  // Placeholder - will be filled by Function node

  title: selectedPaper.title || cvsData.paper_title || 'Unknown',
  authors: selectedPaper.authors || [],
  publication_date: selectedPaper.year ? `${selectedPaper.year}-01-01` : null,
  citation_count: selectedPaper.citations || 0,
  external_id: selectedPaper.paper_id || null,
  source: selectedPaper.paper_id?.includes('arxiv') ? 'arxiv' : 'semantic_scholar',

  // Marketplace fields
  is_published_to_marketplace: true,
  marketplace_description: marketData.executive_summary || cvsData.summary || '',
  tech_category: cvsData.domain || 'Unknown',
  industry: (marketData.target_industries && marketData.target_industries[0]) || 'Unknown',
  stage: stage,
  funding_goal: null,  // Not calculated yet

  // Metadata
  metadata: {
    cvs_score: cvsData.commercial_viability_score,
    viability_tier: cvsData.viability_tier,
    query: cvsData.query,
    workflow_id: cvsData.workflow_id
  }
};

// Prepare cvs_analyses insert
const analysisInsert = {
  // Will be set after paper insert
  paper_id: null,  // Placeholder
  analyzed_by: null,  // Placeholder - will be filled by Function node

  title: cvsData.query || 'Unknown Query',
  query: cvsData.query || 'Unknown Query',

  // Scores
  cvs_score: cvsData.commercial_viability_score,
  technical_score: cvsData.score_breakdown?.technical?.weighted_total || 0,
  market_score: cvsData.score_breakdown?.market?.weighted_total || 0,
  commercial_score: cvsData.score_breakdown?.market?.weighted_total || 0,  // Same as market for now
  competitive_score: cvsData.score_breakdown?.competitive?.weighted_total || 0,
  ip_score: ipData.ip_opportunity_score || 0,
  risk_score: riskScore,

  // Market data
  tam: marketData.market_size_estimate?.tam_billions || 0,
  trl: trl,
  target_industry: (marketData.target_industries && marketData.target_industries[0]) || 'Unknown',

  // Text fields
  summary: marketData.executive_summary || cvsData.summary || '',
  recommendations: cvsData.recommendation || '',
  key_strengths: selectedPaper.competitive_advantages || selectedPaper.key_insights || [],
  key_risks: selectedPaper.risk_factors || selectedPaper.limitations || [],
  go_to_market_strategy: marketData.go_to_market_strategy || '',

  // Status
  status: 'completed',
  is_ai_generated: true,

  // Full analysis data (JSONB)
  analysis_notes: {
    technical_analysis: {
      trl_level: trl,
      trl_reasoning: technicalData.trl_reasoning || '',
      feasibility_score: technicalData.feasibility_score || selectedPaper.feasibility_score || 0,
      commercial_potential: technicalData.commercial_potential || selectedPaper.commercial_potential || 0,
      risk_level: riskLevel,
      risk_factors: selectedPaper.risk_factors || [],
      key_insights: selectedPaper.key_insights || [],
      limitations: selectedPaper.limitations || []
    },
    market_analysis: marketData,
    competitive_analysis: competitiveData,
    ip_analysis: ipData,
    selected_paper: selectedPaper,
    cvs_breakdown: cvsData.score_breakdown
  }
};

return {
  json: {
    opportunity_id: opportunityId,
    user_email: cvsData.user_email || null,
    paper_insert: paperInsert,
    analysis_insert: analysisInsert,

    // Pass through for email
    cvs_data: cvsData
  }
};
```

---

### Node 2: Lookup User Profile ID

**Node Type:** Supabase (Read)
**Name:** `Lookup User Profile ID`
**Operation:** `Get Rows`

**Configuration:**
- **Table:** `profiles`
- **Match:** `email` equals `{{ $json.user_email }}`
- **Return Fields:** `id`, `email`, `user_type`

**Result:** Returns `profile.id` for the user who submitted the query

---

### Node 3: Insert Research Paper

**Node Type:** HTTP Request
**Name:** `Insert Research Paper`

**Configuration:**
- **Method:** POST
- **URL:** `https://vqgwzzzjlswyagncyhih.supabase.co/rest/v1/research_papers`
- **Headers:**
  ```
  Authorization: Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
  apikey: {{ $env.SUPABASE_ANON_KEY }}
  Content-Type: application/json
  Prefer: return=representation
  ```

**Body (JSON):**
```json
{
  "uploaded_by": "{{ $('Lookup User Profile ID').first().json.id }}",
  "title": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.title }}",
  "authors": {{ $('Prepare Supabase Insert Data').first().json.paper_insert.authors }},
  "publication_date": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.publication_date }}",
  "citation_count": {{ $('Prepare Supabase Insert Data').first().json.paper_insert.citation_count }},
  "external_id": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.external_id }}",
  "source": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.source }}",
  "is_published_to_marketplace": true,
  "marketplace_description": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.marketplace_description }}",
  "tech_category": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.tech_category }}",
  "industry": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.industry }}",
  "stage": "{{ $('Prepare Supabase Insert Data').first().json.paper_insert.stage }}",
  "metadata": {{ $('Prepare Supabase Insert Data').first().json.paper_insert.metadata }}
}
```

**Notes:**
- `Prefer: return=representation` returns the created row (including `id`)
- This allows us to get the `paper_id` for the next insert

---

### Node 4: Insert CVS Analysis

**Node Type:** HTTP Request
**Name:** `Insert CVS Analysis`

**Configuration:**
- **Method:** POST
- **URL:** `https://vqgwzzzjlswyagncyhih.supabase.co/rest/v1/cvs_analyses`
- **Headers:**
  ```
  Authorization: Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}
  apikey: {{ $env.SUPABASE_ANON_KEY }}
  Content-Type: application/json
  Prefer: return=representation
  ```

**Body (Code - JavaScript):**
```javascript
const paperData = $('Insert Research Paper').first().json;
const preparedData = $('Prepare Supabase Insert Data').first().json;
const profileData = $('Lookup User Profile ID').first().json;

const analysisInsert = preparedData.analysis_insert;

// Add paper_id and analyzed_by from previous nodes
analysisInsert.paper_id = paperData.id;  // From Insert Research Paper response
analysisInsert.analyzed_by = profileData.id;  // From Lookup User Profile ID

return {
  json: analysisInsert
};
```

---

### Node 5: Log Success

**Node Type:** Code (JavaScript)
**Name:** `Log Supabase Insert Success`

**Code:**
```javascript
const paperData = $('Insert Research Paper').first().json;
const analysisData = $('Insert CVS Analysis').first().json;
const opportunityId = $('Prepare Supabase Insert Data').first().json.opportunity_id;

console.log('=== SUPABASE INSERT SUCCESS ===');
console.log('Opportunity ID:', opportunityId);
console.log('Paper ID:', paperData.id);
console.log('Analysis ID:', analysisData.id);
console.log('CVS Score:', analysisData.cvs_score);

return {
  json: {
    success: true,
    opportunity_id: opportunityId,
    paper_id: paperData.id,
    analysis_id: analysisData.id,
    cvs_score: analysisData.cvs_score,

    // Pass through CVS data for email
    cvs_data: $('Prepare Supabase Insert Data').first().json.cvs_data
  }
};
```

---

## Testing the Integration

### Test 1: Manual Test Insert

**In Supabase SQL Editor:**

```sql
-- Test insert to research_papers
INSERT INTO research_papers (
  uploaded_by,
  title,
  authors,
  source,
  is_published_to_marketplace,
  tech_category,
  industry,
  stage
)
VALUES (
  (SELECT id FROM profiles WHERE email = 'your-test-email@gmail.com'),
  'Test Paper: Attention Mechanisms',
  ARRAY['Test Author 1', 'Test Author 2'],
  'arxiv',
  true,
  'AI/ML',
  'Healthcare',
  'Prototype'
)
RETURNING id, title;

-- Test insert to cvs_analyses (replace paper_id with result from above)
INSERT INTO cvs_analyses (
  paper_id,
  analyzed_by,
  title,
  query,
  cvs_score,
  technical_score,
  market_score,
  commercial_score,
  competitive_score,
  ip_score,
  risk_score,
  tam,
  trl,
  target_industry,
  summary,
  status,
  is_ai_generated
)
VALUES (
  'REPLACE-WITH-PAPER-ID-FROM-ABOVE',
  (SELECT id FROM profiles WHERE email = 'your-test-email@gmail.com'),
  'Test Analysis: AI Drug Discovery',
  'AI drug discovery commercial viability',
  85,
  36,
  41,
  41,
  13,
  7,
  3,
  50,
  6,
  'Healthcare',
  'Test summary - strong commercial potential',
  'completed',
  true
)
RETURNING id, cvs_score;
```

### Test 2: Verify Data

```sql
-- View inserted data
SELECT
  rp.title AS paper_title,
  ca.cvs_score,
  ca.query,
  p.email AS user_email
FROM cvs_analyses ca
JOIN research_papers rp ON ca.paper_id = rp.id
JOIN profiles p ON ca.analyzed_by = p.id
ORDER BY ca.created_at DESC
LIMIT 5;
```

### Test 3: n8n Test Execution

1. **Open n8n workflow:** `00 - Orchestrator Agent_emailFixed`
2. **Add the 5 new nodes** (Prepare, Lookup, Insert Paper, Insert Analysis, Log)
3. **Connect nodes:** CVS Calculate → Prepare → Lookup → Insert Paper → Insert Analysis → Log
4. **Add branch:** Log → Format Email (keep email flow)
5. **Test with manual execution**
6. **Check Supabase Table Editor:** Verify `research_papers` and `cvs_analyses` tables have new rows

---

## Troubleshooting

### Issue: "Row-level security policy violated"

**Cause:** RLS policies blocking inserts

**Fix:**
```sql
-- Temporarily disable RLS for testing (re-enable later!)
ALTER TABLE research_papers DISABLE ROW LEVEL SECURITY;
ALTER TABLE cvs_analyses DISABLE ROW LEVEL SECURITY;
```

**For production:** Update RLS policies to allow service role inserts:
```sql
-- Allow service role to insert
CREATE POLICY "Service role can insert" ON research_papers
  FOR INSERT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert" ON cvs_analyses
  FOR INSERT
  TO service_role
  USING (true);
```

---

### Issue: "Foreign key constraint violation"

**Cause:** `uploaded_by` or `analyzed_by` doesn't match a valid `profiles.id`

**Fix:**
```sql
-- Check if user exists
SELECT id, email FROM profiles WHERE email = 'your-test-email@gmail.com';

-- If not, create test user
INSERT INTO profiles (id, email, user_type)
VALUES (
  gen_random_uuid(),
  'your-test-email@gmail.com',
  'startup'
);
```

---

### Issue: "JSONB syntax error"

**Cause:** Malformed JSON in `analysis_notes` or `metadata` fields

**Fix:** Validate JSON before insert:
- Use https://jsonlint.com/
- Check for:
  - Unescaped quotes
  - Trailing commas
  - Missing brackets

---

## Environment Variables

**Required in n8n:**

Add these to your n8n environment or workflow credentials:

```bash
SUPABASE_URL=https://vqgwzzzjlswyagncyhih.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get keys from:**
- Supabase Dashboard → Settings → API
- **Anon key:** Public, safe for client-side
- **Service role key:** Private, bypasses RLS (use for n8n)

---

## Success Criteria

After completing this step, you should have:

- [x] 5 new n8n nodes added to orchestrator
- [x] Test execution completes without errors
- [x] `research_papers` table has 1+ test rows
- [x] `cvs_analyses` table has 1+ test rows
- [x] JOIN query returns valid data
- [x] Email report still sends (existing flow works)

**Next Step:** Move to Step 2 (Fake Data Generation)
