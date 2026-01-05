# n8n Step-by-Step Implementation Guide
**Complete Instructions with Screenshots & Code**

---

## 🎯 Goal

Add 5 nodes to your n8n orchestrator to save CVS analysis results to Supabase.

**What you'll fix:**
1. ✅ Undefined CVS score issue
2. ✅ Save papers to `research_papers` table
3. ✅ Save analyses to `cvs_analyses` table
4. ✅ Enable real marketplace data

---

## 📋 Before You Start

### Prerequisites Checklist:
- [ ] n8n workflow `00 - Orchestrator Agent_emailFixed` is open
- [ ] You're logged into n8n
- [ ] You have Supabase credentials ready:
  - Host: `https://vqgwzzzjlswyagncyhih.supabase.co`
  - Service Role Key: (from Supabase Dashboard → Settings → API)

---

## 🔧 STEP 1: Add Supabase Credential (5 minutes)

### 1.1 Open Credentials Settings

In n8n:
1. Click your profile icon (top right)
2. Click **"Credentials"**
3. Click **"Add Credential"** button

### 1.2 Configure Supabase Credential

1. **Search for:** `Supabase`
2. **Click:** Supabase icon
3. **Fill in the form:**

```
Credential Name: R2M Supabase
Host: https://vqgwzzzjlswyagncyhih.supabase.co
Service Role Secret: [PASTE YOUR SERVICE_ROLE KEY HERE]
```

**Where to find Service Role Key:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy **service_role** key (NOT anon key!)

4. **Click:** "Save" button

✅ **Test:** Credential should show green checkmark

---

## 🔧 STEP 2: Find Where to Add Nodes (3 minutes)

### 2.1 Open Your Workflow

1. Go to **Workflows** in n8n
2. Open: `00 - Orchestrator Agent_emailFixed`

### 2.2 Locate Last Node

Scroll to find the last node in your workflow. It should be one of:
- "Send Email Report"
- "Format Email"
- Or a node after IP Agent

**We'll add our 5 new nodes AFTER this last node.**

---

## 🔧 STEP 3: Add Node 1 - Prepare Supabase Insert Data (15 minutes)

### 3.1 Add Function Node

1. **Click:** The **+** button after your last node
2. **Search for:** `Function`
3. **Click:** Function node
4. **Rename node to:** `Prepare Supabase Insert Data`

### 3.2 Paste This Code

Click on the node → **JavaScript Code** tab → Paste this code:

```javascript
// ========================================
// PREPARE SUPABASE INSERT DATA
// ========================================

// STEP 1: Get data from previous nodes
const discoveryData = $('02_discoveryAgent').first().json;
const technicalData = $('03_technicalAgent').first().json;
const marketData = $('05_marketAgent').first().json;
const competitiveData = $('06_competitiveAgent').first().json;
const ipData = $('07_ipAgent').first().json;

// Get selected paper (best paper from discovery)
const selectedPaper = discoveryData.papers?.[0] || discoveryData.selectedPaper || {};

// Get user email from input (or use demo)
const userEmail = $('01_userQueryInput').first().json.email || 'demo+investor_ai@gmail.com';
const originalQuery = $('01_userQueryInput').first().json.query || '';

// STEP 2: Generate unique opportunity ID
const today = new Date();
const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20251216
const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
const opportunityId = `R2M-${dateStr}-${randomSuffix}`;

// STEP 3: Extract TRL and map to stage
const trl = technicalData.trl_level || technicalData.technology_readiness_level || 5;
let stage = 'Concept';
if (trl >= 9) stage = 'Market-Ready';
else if (trl >= 7) stage = 'Pilot';
else if (trl >= 4) stage = 'Prototype';

// STEP 4: Calculate CVS score
let cvsScore = 0;
let technicalScore = 0;
let marketScore = 0;
let competitiveScore = 0;
let ipScore = 0;

// Extract scores from agent outputs
if (technicalData.feasibility_score) {
  technicalScore = (technicalData.feasibility_score / 10) * 40; // Convert 0-10 to 0-40
}

if (marketData.market_potential_score) {
  marketScore = (marketData.market_potential_score / 10) * 45; // Convert 0-10 to 0-45
}

if (competitiveData.competitive_advantage_score) {
  competitiveScore = (competitiveData.competitive_advantage_score / 10) * 15; // Convert 0-10 to 0-15
}

if (ipData.ip_opportunity_score) {
  ipScore = ipData.ip_opportunity_score; // Already 0-10
}

// Calculate total CVS score
cvsScore = Math.round(technicalScore + marketScore + competitiveScore);

// STEP 5: Prepare research_papers data
const paperData = {
  title: selectedPaper.title || 'Untitled Research',
  authors: selectedPaper.authors || [],
  abstract: selectedPaper.abstract || selectedPaper.tldr || '',
  publication_date: selectedPaper.year ? `${selectedPaper.year}-01-01` : null,
  citation_count: selectedPaper.citations || selectedPaper.citationCount || 0,
  external_id: selectedPaper.paper_id || selectedPaper.paperId || selectedPaper.doi || null,
  source: selectedPaper.source || 'semantic_scholar',
  tech_category: discoveryData.domain || 'General',
  industry: marketData.target_industries?.[0] || marketData.primary_industry || 'Technology',
  stage: stage,
  is_published_to_marketplace: true,
};

// STEP 6: Prepare cvs_analyses data
const analysisData = {
  title: originalQuery || selectedPaper.title,
  query: originalQuery,
  cvs_score: cvsScore,
  technical_score: Math.round(technicalScore),
  market_score: Math.round(marketScore),
  commercial_score: Math.round(marketScore), // Same as market for now
  competitive_score: Math.round(competitiveScore),
  ip_score: Math.round(ipScore),
  risk_score: technicalData.risk_level === 'high' ? 8 : technicalData.risk_level === 'medium' ? 5 : 3,
  tam: marketData.market_size_billions || marketData.tam_billions || 0,
  trl: trl,
  target_industry: marketData.target_industries?.[0] || marketData.primary_industry || null,
  summary: marketData.executive_summary || marketData.summary || '',
  recommendations: marketData.recommendation || technicalData.recommendation || '',
  key_strengths: marketData.key_opportunities || technicalData.strengths || [],
  key_risks: technicalData.risks || marketData.challenges || [],
  go_to_market_strategy: marketData.go_to_market_strategy || '',
  status: 'completed',
  is_ai_generated: true,
  analysis_notes: {
    opportunity_id: opportunityId,
    technical_analysis: technicalData,
    market_analysis: marketData,
    competitive_analysis: competitiveData,
    ip_analysis: ipData,
    discovery_data: discoveryData,
  },
};

// STEP 7: Log for debugging
console.log('✅ Data prepared successfully');
console.log(`Opportunity ID: ${opportunityId}`);
console.log(`CVS Score: ${cvsScore}`);
console.log(`Paper: ${paperData.title}`);

// STEP 8: Return prepared data
return [
  {
    json: {
      user_email: userEmail,
      opportunity_id: opportunityId,
      paper_data: paperData,
      analysis_data: analysisData,
      cvs_score: cvsScore,
    }
  }
];
```

### 3.3 Test the Node

1. **Click:** "Execute Node" button
2. **Check Output:** Should see `paper_data`, `analysis_data`, `opportunity_id`
3. **Verify CVS Score:** Should see a number (not undefined!)

✅ **Success:** Output shows all data with CVS score calculated

---

## 🔧 STEP 4: Add Node 2 - Insert Research Paper (10 minutes)

### 4.1 Add Supabase Node

1. **Click:** + button after "Prepare Supabase Insert Data"
2. **Search for:** `Supabase`
3. **Click:** Supabase node
4. **Rename to:** `Insert Research Paper`

### 4.2 Configure the Node

**Credentials:**
- Click "Credential to connect with" dropdown
- Select: `R2M Supabase`

**Resource:** `Row`

**Operation:** `Insert`

**Table:** `research_papers`

**Rows (click "Add Row"):**
1. Click the **Expression** tab (toggle from Fixed)
2. Paste this expression:
   ```javascript
   {{ $json.paper_data }}
   ```

**Options:**
1. Click "Add Option"
2. Select "Return Fields"
3. Click "Add Field"
4. Type: `id`

### 4.3 Test the Node

1. **Click:** "Execute Node"
2. **Check Output:** Should return `{ "id": "uuid-here" }`
3. **Verify in Supabase:**
   - Open Supabase Dashboard → Table Editor
   - Open `research_papers` table
   - Should see 1 new row

✅ **Success:** New row in research_papers table

---

## 🔧 STEP 5: Add Node 3 - Insert CVS Analysis (10 minutes)

### 5.1 Add Supabase Node

1. **Click:** + button after "Insert Research Paper"
2. **Search for:** `Supabase`
3. **Click:** Supabase node
4. **Rename to:** `Insert CVS Analysis`

### 5.2 Configure the Node

**Credentials:** `R2M Supabase`

**Resource:** `Row`

**Operation:** `Insert`

**Table:** `cvs_analyses`

**Rows:**
1. Click **Expression** tab
2. Paste this code:
   ```javascript
   {{ Object.assign({}, $json.analysis_data, { paper_id: $('Insert Research Paper').first().json.id }) }}
   ```

**Alternative (if above doesn't work):**
```javascript
{{
  {
    "paper_id": "{{ $('Insert Research Paper').first().json.id }}",
    "title": "{{ $('Prepare Supabase Insert Data').first().json.analysis_data.title }}",
    "query": "{{ $('Prepare Supabase Insert Data').first().json.analysis_data.query }}",
    "cvs_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.cvs_score }},
    "technical_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.technical_score }},
    "market_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.market_score }},
    "commercial_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.commercial_score }},
    "competitive_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.competitive_score }},
    "ip_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.ip_score }},
    "risk_score": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.risk_score }},
    "tam": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.tam }},
    "trl": {{ $('Prepare Supabase Insert Data').first().json.analysis_data.trl }},
    "target_industry": "{{ $('Prepare Supabase Insert Data').first().json.analysis_data.target_industry }}",
    "summary": "{{ $('Prepare Supabase Insert Data').first().json.analysis_data.summary }}",
    "recommendations": "{{ $('Prepare Supabase Insert Data').first().json.analysis_data.recommendations }}",
    "key_strengths": {{ JSON.stringify($('Prepare Supabase Insert Data').first().json.analysis_data.key_strengths) }},
    "key_risks": {{ JSON.stringify($('Prepare Supabase Insert Data').first().json.analysis_data.key_risks) }},
    "go_to_market_strategy": "{{ $('Prepare Supabase Insert Data').first().json.analysis_data.go_to_market_strategy }}",
    "status": "completed",
    "is_ai_generated": true,
    "analysis_notes": {{ JSON.stringify($('Prepare Supabase Insert Data').first().json.analysis_data.analysis_notes) }}
  }
}}
```

**Options:**
1. Add Option → "Return Fields"
2. Add Field → Type: `id`

### 5.3 Test the Node

1. **Click:** "Execute Node"
2. **Check Output:** Should return `{ "id": "uuid-here" }`
3. **Verify in Supabase:**
   - Open `cvs_analyses` table
   - Should see 1 new row
   - Check `paper_id` matches ID from step 4

✅ **Success:** New row in cvs_analyses with paper_id link

---

## 🔧 STEP 6: Add Node 4 - Get User Profile (10 minutes)

### 6.1 Add Supabase Node

1. **Click:** + after "Insert CVS Analysis"
2. **Add:** Supabase node
3. **Rename to:** `Get User Profile`

### 6.2 Configure the Node

**Credentials:** `R2M Supabase`

**Resource:** `Row`

**Operation:** `Get`

**Table:** `profiles`

**Filters (click "Add Filter"):**
1. **Column:** `email`
2. **Operator:** `=` (equals)
3. **Value (Expression mode):**
   ```javascript
   {{ $('Prepare Supabase Insert Data').first().json.user_email }}
   ```

**Options:**
- Add Option → "Return Fields"
- Add Field → Type: `id`

### 6.3 Test the Node

1. **Click:** "Execute Node"
2. **Check Output:** Should return user ID

**If no user found:**
Run this SQL in Supabase to verify user exists:
```sql
SELECT id, email FROM profiles WHERE email LIKE '%investor%';
```

---

## 🔧 STEP 7: Add Node 5 - Update Analysis with User (10 minutes)

### 7.1 Add Supabase Node

1. **Click:** + after "Get User Profile"
2. **Add:** Supabase node
3. **Rename to:** `Update Analysis with User`

### 7.2 Configure the Node

**Credentials:** `R2M Supabase`

**Resource:** `Row`

**Operation:** `Update`

**Table:** `cvs_analyses`

**Filters:**
1. **Column:** `id`
2. **Operator:** `=`
3. **Value (Expression):**
   ```javascript
   {{ $('Insert CVS Analysis').first().json.id }}
   ```

**Update Fields (click "Add Field"):**

Field 1:
- **Name:** `analyzed_by`
- **Value (Expression):**
  ```javascript
  {{ $('Get User Profile').first().json.id }}
  ```

Field 2:
- **Name:** `uploaded_by`
- **Value (Expression):**
  ```javascript
  {{ $('Get User Profile').first().json.id }}
  ```

### 7.3 Test the Node

1. **Click:** "Execute Node"
2. **Verify in Supabase:**
   ```sql
   SELECT id, analyzed_by, uploaded_by
   FROM cvs_analyses
   ORDER BY created_at DESC
   LIMIT 1;
   ```

✅ **Success:** `analyzed_by` and `uploaded_by` are not null

---

## 🔧 STEP 8: Add Node 6 - Log Success (5 minutes)

### 8.1 Add Function Node

1. **Click:** + after "Update Analysis with User"
2. **Add:** Function node
3. **Rename to:** `Log Success`

### 8.2 Paste This Code

```javascript
// ========================================
// LOG SUCCESS
// ========================================

const analysisId = $('Insert CVS Analysis').first().json.id;
const paperId = $('Insert Research Paper').first().json.id;
const opportunityId = $('Prepare Supabase Insert Data').first().json.opportunity_id;
const cvsScore = $('Prepare Supabase Insert Data').first().json.cvs_score;
const userId = $('Get User Profile').first().json.id;

// Log to n8n console
console.log('========================================');
console.log('✅ CVS ANALYSIS SAVED TO SUPABASE!');
console.log('========================================');
console.log(`Analysis ID: ${analysisId}`);
console.log(`Paper ID: ${paperId}`);
console.log(`Opportunity ID: ${opportunityId}`);
console.log(`CVS Score: ${cvsScore}`);
console.log(`User ID: ${userId}`);
console.log('========================================');

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

### 8.3 Test the Node

1. **Click:** "Execute Node"
2. **Check console output** (should see the log messages)

---

## ✅ STEP 9: Test Full Workflow (15 minutes)

### 9.1 Execute Complete Workflow

1. **Click:** "Execute Workflow" button (top right)
2. **Provide test input** (if needed):
   ```json
   {
     "query": "quantum computing for drug discovery",
     "email": "demo+investor_ai@gmail.com"
   }
   ```

3. **Wait for completion** (2-5 minutes)

### 9.2 Verify All Nodes Green

Check all nodes show green checkmarks:
- ✅ Prepare Supabase Insert Data
- ✅ Insert Research Paper
- ✅ Insert CVS Analysis
- ✅ Get User Profile
- ✅ Update Analysis with User
- ✅ Log Success

### 9.3 Verify Database

Run these SQL queries in Supabase:

```sql
-- Check research_papers
SELECT
  id,
  title,
  stage,
  citation_count,
  created_at
FROM research_papers
ORDER BY created_at DESC
LIMIT 1;

-- Check cvs_analyses
SELECT
  id,
  title,
  cvs_score,
  tam,
  trl,
  analyzed_by,
  paper_id,
  created_at
FROM cvs_analyses
ORDER BY created_at DESC
LIMIT 1;

-- Verify linkage
SELECT
  p.title as paper_title,
  c.cvs_score,
  c.tam,
  c.trl,
  prof.email as analyzed_by_email,
  c.paper_id = p.id as "correctly_linked"
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
JOIN profiles prof ON c.analyzed_by = prof.id
ORDER BY c.created_at DESC
LIMIT 1;
```

**Expected Results:**
- 1 new row in `research_papers`
- 1 new row in `cvs_analyses`
- `cvs_score` is a number (not null)
- `paper_id` matches between tables
- `analyzed_by` is not null
- `correctly_linked` = true

---

## 🎉 SUCCESS CRITERIA

You've successfully implemented the integration if:

- [ ] All 6 new nodes execute without errors (green checkmarks)
- [ ] Console shows "CVS ANALYSIS SAVED TO SUPABASE!"
- [ ] Database has 1 new row in `research_papers`
- [ ] Database has 1 new row in `cvs_analyses`
- [ ] CVS score is calculated (not undefined!)
- [ ] Foreign keys link correctly

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot read property 'json' of undefined"

**Cause:** Node name doesn't match

**Fix:**
1. Check your node names match exactly:
   - `02_discoveryAgent`
   - `03_technicalAgent`
   - `05_marketAgent`
   - etc.
2. Update code in Node 1 with your actual node names

### Issue: Foreign Key Violation

**Cause:** User doesn't exist in profiles

**Fix:**
```sql
-- Check if user exists
SELECT id, email FROM profiles WHERE email = 'demo+investor_ai@gmail.com';

-- If not found, create user using seed script:
-- Run: supabase/seed_investors_YOUR_EMAIL.sql
```

### Issue: Analysis Saves but CVS Score is 0

**Cause:** Agent outputs don't have expected field names

**Fix:** Update Node 1 code to match your agent output structure. Check:
```javascript
console.log('Technical Data:', JSON.stringify(technicalData));
console.log('Market Data:', JSON.stringify(marketData));
```

Then adjust field names in Node 1 accordingly.

---

## 📊 SQL QUERIES FOR VERIFICATION

### Quick Health Check
```sql
-- Count rows
SELECT
  (SELECT COUNT(*) FROM research_papers) as papers,
  (SELECT COUNT(*) FROM cvs_analyses) as analyses,
  (SELECT COUNT(*) FROM profiles) as users;
```

### View Recent Analyses
```sql
SELECT
  c.title,
  c.cvs_score,
  c.tam,
  c.trl,
  p.title as paper_title,
  prof.email as analyst_email,
  c.created_at
FROM cvs_analyses c
LEFT JOIN research_papers p ON c.paper_id = p.id
LEFT JOIN profiles prof ON c.analyzed_by = prof.id
ORDER BY c.created_at DESC
LIMIT 5;
```

### Check for Orphaned Records
```sql
-- Analyses without papers
SELECT COUNT(*) as orphaned_analyses
FROM cvs_analyses c
LEFT JOIN research_papers p ON c.paper_id = p.id
WHERE p.id IS NULL;

-- Should return 0
```

---

## 🚀 NEXT STEPS

After successful implementation:

### 1. Update Marketplace UI (30 min)

Edit `src/app/marketplace/page.tsx`:

```typescript
// Replace mockOpportunities with real data
const [opportunities, setOpportunities] = useState([])

useEffect(() => {
  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('cvs_analyses')
      .select(`
        *,
        research_papers (
          title,
          authors,
          abstract,
          stage,
          citation_count
        )
      `)
      .eq('status', 'completed')
      .order('cvs_score', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching opportunities:', error)
      return
    }

    setOpportunities(data || [])
  }

  fetchOpportunities()
}, [])
```

### 2. Test Marketplace

1. Run: `npm run dev`
2. Go to: `http://localhost:3000/marketplace`
3. Should see real opportunities (not mock data!)

### 3. Test Full User Flow

1. Login as investor
2. Browse marketplace
3. Click opportunity
4. View CVS scores, TAM, TRL
5. Request introduction

---

**Estimated Total Time:** 1.5-2 hours
**Difficulty:** Intermediate
**Status:** Ready to implement! 🚀

Good luck!
