# n8n Node Code Snippets - Ready to Copy/Paste

**Last Updated:** December 16, 2025
**Purpose:** Complete JavaScript code for all 5 n8n integration nodes
**Usage:** Copy each code block directly into n8n Function nodes

---

## Node 1: Prepare Supabase Insert Data (Function Node)

**Node Type:** Function
**Position:** After "Send Email Report" node
**Name:** `Prepare Supabase Insert Data`

### Configuration:
- Language: JavaScript
- Mode: Run Once for All Items

### Code:

```javascript
// ========================================
// Node 1: Prepare Supabase Insert Data
// ========================================
// Purpose: Transform n8n agent data → Supabase-ready format
// Input: Data from all 5 agents + CVS calculation
// Output: { paper_data, analysis_data, opportunity_id, user_email }
// ========================================

// ===== STEP 1: GET DATA FROM PREVIOUS NODES =====

// Get selected paper (from Discovery Agent → Select Best Paper)
const selectedPaper = $('Select Best Paper for MarketAnalysis').first().json;

// Get analysis results from 4 agents
const technicalData = $('Technical Analysis Agent').first().json;
const marketData = $('Market Analysis Agent').first().json;
const competitiveData = $('Competitive Analysis Agent').first().json;
const ipData = $('IP Analysis Agent').first().json;

// Get CVS calculation result
const cvsData = $('Calculate Commercial Viability Score').first().json;

// Get user email from initial query input (or use demo account)
const userEmail = $input.first().json.user_email || 'demo+investor_ai@gmail.com';

// ===== STEP 2: GENERATE UNIQUE OPPORTUNITY ID =====

const today = new Date();
const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20251216
const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
const opportunityId = `R2M-${dateStr}-${randomSuffix}`;

// ===== STEP 3: MAP TRL TO STAGE =====

// Extract TRL from paper or technical analysis
const trl = selectedPaper.trl_level || technicalData.trl_level || 0;

// Map TRL 1-9 to stage
let stage = 'Concept';
if (trl >= 9) {
  stage = 'Market-Ready';
} else if (trl >= 7) {
  stage = 'Pilot';
} else if (trl >= 4) {
  stage = 'Prototype';
}

// ===== STEP 4: PREPARE RESEARCH_PAPERS DATA =====

const paperData = {
  title: selectedPaper.title || 'Untitled Research',
  authors: selectedPaper.authors || [],
  abstract: selectedPaper.abstract || '',
  publication_date: selectedPaper.year ? `${selectedPaper.year}-01-01` : null,
  citation_count: selectedPaper.citations || 0,
  external_id: selectedPaper.paper_id || selectedPaper.doi || null,
  source: selectedPaper.source || 'semantic_scholar',
  tech_category: $input.first().json.domain || 'General',
  industry: marketData.target_industries?.[0] || 'Technology',
  stage: stage,
  is_published_to_marketplace: true,
};

// ===== STEP 5: PREPARE CVS_ANALYSES DATA =====

const analysisData = {
  title: $input.first().json.query || selectedPaper.title,
  query: $input.first().json.query || '',
  cvs_score: cvsData.commercial_viability_score || 0,
  technical_score: cvsData.score_breakdown?.technical?.weighted_total || 0,
  market_score: cvsData.score_breakdown?.market?.weighted_total || 0,
  commercial_score: cvsData.score_breakdown?.market?.weighted_total || 0,
  competitive_score: cvsData.score_breakdown?.competitive?.weighted_total || 0,
  ip_score: ipData.ip_opportunity_score || 0,
  risk_score: technicalData.risk_level === 'high' ? 8 : technicalData.risk_level === 'medium' ? 5 : 3,
  tam: marketData.market_size_estimate?.tam_billions || 0,
  trl: trl,
  target_industry: marketData.target_industries?.[0] || null,
  summary: marketData.executive_summary || '',
  recommendations: cvsData.recommendation || '',
  key_strengths: selectedPaper.competitive_advantages || [],
  key_risks: selectedPaper.risk_factors || [],
  go_to_market_strategy: marketData.go_to_market_strategy || '',
  status: 'completed',
  is_ai_generated: true,
  analysis_notes: {
    technical_analysis: technicalData,
    market_analysis: marketData,
    competitive_analysis: competitiveData,
    ip_analysis: ipData,
    full_recommendation: cvsData,
  },
};

// ===== STEP 6: RETURN PREPARED DATA =====

return [
  {
    json: {
      user_email: userEmail,
      opportunity_id: opportunityId,
      paper_data: paperData,
      analysis_data: analysisData,
    }
  }
];
```

---

## Node 2: Insert Research Paper (Supabase Node)

**Node Type:** Supabase
**Position:** After "Prepare Supabase Insert Data"
**Name:** `Insert Research Paper`

### Configuration:

**Credentials:**
- Select: `R2M Supabase` (created in Step 1 of checklist)

**Operation:**
- Resource: `Row`
- Operation: `Insert`

**Table:**
- Table: `research_papers`

**Data to Send:**
- Mode: `Expression` (click toggle)
- Expression:
  ```javascript
  {{ $json.paper_data }}
  ```

**Options:**
- Return Fields: **Check this box** and select `id`
- (This is critical - we need the paper ID for the next node)

**Expected Output:**
```json
{
  "id": "uuid-of-inserted-paper"
}
```

---

## Node 3: Insert CVS Analysis (Supabase Node)

**Node Type:** Supabase
**Position:** After "Insert Research Paper"
**Name:** `Insert CVS Analysis`

### Configuration:

**Credentials:**
- Select: `R2M Supabase`

**Operation:**
- Resource: `Row`
- Operation: `Insert`

**Table:**
- Table: `cvs_analyses`

**Data to Send:**
- Mode: `Expression`
- Expression:
  ```javascript
  {{
    {
      ...JSON.parse('{{ $("Prepare Supabase Insert Data").first().json.analysis_data }}'),
      paper_id: '{{ $("Insert Research Paper").first().json.id }}'
    }
  }}
  ```

**Explanation:** This merges the analysis_data from Node 1 with the paper_id from Node 2.

**Options:**
- Return Fields: **Check this box** and select `id`
- (We need the analysis ID for the next node)

**Expected Output:**
```json
{
  "id": "uuid-of-inserted-analysis"
}
```

---

## Node 4A: Get User Profile (Supabase Node)

**Node Type:** Supabase
**Position:** After "Insert CVS Analysis"
**Name:** `Get User Profile`

### Configuration:

**Credentials:**
- Select: `R2M Supabase`

**Operation:**
- Resource: `Row`
- Operation: `Get`

**Table:**
- Table: `profiles`

**Filter:**
- Select: `Filters` → `Add Filter`
- Column: `email`
- Operator: `=` (equals)
- Value (Expression mode):
  ```javascript
  {{ $("Prepare Supabase Insert Data").first().json.user_email }}
  ```

**Options:**
- Return Fields: Select `id`

**Expected Output:**
```json
{
  "id": "uuid-of-user-profile"
}
```

---

## Node 4B: Update Analysis with User (Supabase Node)

**Node Type:** Supabase
**Position:** After "Get User Profile"
**Name:** `Update Analysis with User`

### Configuration:

**Credentials:**
- Select: `R2M Supabase`

**Operation:**
- Resource: `Row`
- Operation: `Update`

**Table:**
- Table: `cvs_analyses`

**Filter:**
- Column: `id`
- Operator: `=`
- Value (Expression mode):
  ```javascript
  {{ $("Insert CVS Analysis").first().json.id }}
  ```

**Data to Send:**
- Mode: `Expression`
- Expression:
  ```javascript
  {{
    {
      "analyzed_by": "{{ $("Get User Profile").first().json.id }}",
      "uploaded_by": "{{ $("Get User Profile").first().json.id }}"
    }
  }}
  ```

**Expected Output:**
```json
{
  "id": "uuid-of-updated-analysis",
  "analyzed_by": "uuid-of-user",
  "uploaded_by": "uuid-of-user"
}
```

---

## Node 5: Log Success (Function Node)

**Node Type:** Function
**Position:** After "Update Analysis with User"
**Name:** `Log Success`

### Configuration:
- Language: JavaScript
- Mode: Run Once for All Items

### Code:

```javascript
// ========================================
// Node 5: Log Success
// ========================================
// Purpose: Confirm success and log details for debugging
// ========================================

const analysisId = $('Insert CVS Analysis').first().json.id;
const opportunityId = $('Prepare Supabase Insert Data').first().json.opportunity_id;
const cvsScore = $('Prepare Supabase Insert Data').first().json.analysis_data.cvs_score;
const paperId = $('Insert Research Paper').first().json.id;
const userId = $('Get User Profile').first().json.id;

// Log to n8n console
console.log('✅ CVS Analysis saved to Supabase!');
console.log(`Analysis ID: ${analysisId}`);
console.log(`Paper ID: ${paperId}`);
console.log(`Opportunity ID: ${opportunityId}`);
console.log(`CVS Score: ${cvsScore}`);
console.log(`User ID: ${userId}`);

// Return success object
return [
  {
    json: {
      success: true,
      analysis_id: analysisId,
      paper_id: paperId,
      opportunity_id: opportunityId,
      cvs_score: cvsScore,
      user_id: userId,
      message: 'CVS analysis successfully saved to database',
      timestamp: new Date().toISOString(),
    }
  }
];
```

---

## Alternative: Node 4 (Without User Email - Demo Mode)

If you don't have `user_email` in your workflow input, use this simplified version:

### Node 4 (Simplified): Set Demo User ID (Set Node)

**Node Type:** Set
**Name:** `Set Demo User ID`

### Configuration:

**Mode:** Manual

**Fields to Set:**
- Field 1:
  - Name: `demo_user_id`
  - Value: `PASTE-UUID-FROM-SUPABASE-HERE`

### How to get the UUID:

1. Open Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   SELECT id FROM profiles
   WHERE email LIKE '%investor_ai%'
   LIMIT 1;
   ```
3. Copy the UUID
4. Paste into the Value field above

Then modify Node 3 (Insert CVS Analysis) to use this demo ID:

```javascript
{{
  {
    ...JSON.parse('{{ $("Prepare Supabase Insert Data").first().json.analysis_data }}'),
    paper_id: '{{ $("Insert Research Paper").first().json.id }}',
    analyzed_by: '{{ $("Set Demo User ID").first().json.demo_user_id }}',
    uploaded_by: '{{ $("Set Demo User ID").first().json.demo_user_id }}'
  }
}}
```

---

## Testing Checklist

After adding all 5 nodes:

### Visual Verification:
- [ ] All 5 nodes are connected (no gaps)
- [ ] Node names match exactly (for expression references)
- [ ] Supabase credential selected in all Supabase nodes
- [ ] "Return Fields" checked in Nodes 2 & 3

### Execute Test:
1. Click "Execute Workflow" button in n8n
2. Provide test input:
   ```json
   {
     "query": "AI for drug discovery",
     "domain": "Healthcare",
     "user_email": "YOUR_EMAIL+investor_ai@gmail.com"
   }
   ```
3. Check all nodes turn green ✅
4. Check "Log Success" node output shows all IDs

### Database Verification:
1. Open Supabase → Table Editor
2. Check `research_papers`:
   ```sql
   SELECT * FROM research_papers
   ORDER BY created_at DESC
   LIMIT 1;
   ```
3. Check `cvs_analyses`:
   ```sql
   SELECT * FROM cvs_analyses
   ORDER BY created_at DESC
   LIMIT 1;
   ```
4. Verify both rows exist and `paper_id` matches

### Data Quality Check:
- [ ] Title is not empty
- [ ] CVS score is 0-100 (not null)
- [ ] TAM is reasonable number
- [ ] TRL is 1-9
- [ ] Summary exists
- [ ] `analyzed_by` is not null

---

## Common Errors & Solutions

### Error: "Cannot read property 'json' of undefined"

**Cause:** Previous node failed or didn't return data

**Fix:**
1. Check "Insert Research Paper" succeeded
2. Verify it returned an `id` field
3. Check "Return Fields" is checked

### Error: "Foreign key constraint violation"

**Cause:** `paper_id` or `analyzed_by` doesn't exist

**Fix:**
1. Verify "Insert Research Paper" succeeded first
2. Check user exists in `profiles` table
3. Run verification query:
   ```sql
   SELECT id FROM profiles WHERE email = 'YOUR_EMAIL+investor_ai@gmail.com';
   ```

### Error: "Null value in NOT NULL column"

**Cause:** Required field missing in data

**Fix:**
1. Check `cvs_score` is not null in analysis_data
2. Verify `title` is populated
3. Ensure `status` is set to 'completed'

### Error: "Invalid JSON"

**Cause:** Syntax error in expression

**Fix:**
1. Use n8n's Expression Editor (click fx icon)
2. Test expression with "Test Step" button
3. Check quotes are escaped properly

---

## Quick Reference: Node Connection Flow

```
[Send Email Report]
    ↓
[Prepare Supabase Insert Data] (Function)
    ↓
[Insert Research Paper] (Supabase INSERT)
    ↓
[Insert CVS Analysis] (Supabase INSERT)
    ↓
[Get User Profile] (Supabase GET)
    ↓
[Update Analysis with User] (Supabase UPDATE)
    ↓
[Log Success] (Function)
    ↓
[END]
```

---

## Estimated Time: 1.5-2 hours

**Breakdown:**
- Node 1 (Prepare Data): 15 min
- Node 2 (Insert Paper): 10 min
- Node 3 (Insert Analysis): 10 min
- Node 4A (Get User): 5 min
- Node 4B (Update): 5 min
- Node 5 (Log): 5 min
- Testing & Debugging: 30-40 min

---

**Ready to implement?** Start with Node 1 and work sequentially through to Node 5! 🚀
