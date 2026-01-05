# n8n → Supabase Integration Checklist
**Quick Start Guide for Adding 5 Nodes to n8n Orchestrator**
**Estimated Time**: 1.5-2 hours
**Last Updated**: December 15, 2025

---

## 🎯 Goal

Connect your n8n CVS analysis workflow to Supabase so that:
- ✅ Analysis results automatically save to database
- ✅ Marketplace shows real CVS scores (not mock data)
- ✅ Users can publish opportunities from analyses

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] n8n workflow `00 - Orchestrator Agent_emailFixed` open
- [ ] Supabase credentials ready (from `.env.local`)
- [ ] Migration 009 & 010 run in Supabase (researcher_connections + profile JSONB)
- [ ] At least 1 test user in `profiles` table

---

## 🔧 Step-by-Step Implementation

### Step 1: Add Supabase Credentials to n8n (5 minutes)

1. **Open n8n** → Go to **Settings** → **Credentials**
2. **Click "New Credential"**
3. **Select "Supabase"** from the list
4. **Fill in details**:
   ```
   Name: R2M Supabase
   Host: https://vqgwzzzjlswyagncyhih.supabase.co
   Service Role Secret: [Get from Supabase Dashboard → Settings → API]
   ```

   **Where to find Service Role Secret**:
   - Open Supabase Dashboard
   - Go to Project Settings → API
   - Copy **service_role** key (NOT anon key!)
   - **⚠️ Keep this secret!** It bypasses RLS policies

5. **Click "Save"**

---

### Step 2: Find the Right Place to Insert Nodes (10 minutes)

**In your n8n orchestrator workflow, locate**:

```
Last node: "Send Email Report"
  ↓
[This is where we insert our 5 new nodes]
```

**Current flow (before changes)**:
```
Calculate CVS Score → Format Email → Send Email Report → END
```

**New flow (after changes)**:
```
Calculate CVS Score → Format Email → Send Email Report
  ↓
  [NEW] Prepare Supabase Insert Data
  ↓
  [NEW] Insert Research Paper
  ↓
  [NEW] Insert CVS Analysis
  ↓
  [NEW] Update Analysis with Paper ID
  ↓
  [NEW] Success Notification
```

---

### Step 3: Add Node 1 - Prepare Supabase Insert Data (15 minutes)

**Purpose**: Transform n8n data into Supabase-ready format

1. **Click "+" after "Send Email Report" node**
2. **Search for**: "Function" node
3. **Rename to**: `Prepare Supabase Insert Data`
4. **Click on the node → JavaScript Code tab**
5. **Paste this code**:

```javascript
// ========================================
// Prepare Supabase Insert Data
// ========================================

// Get data from previous nodes
const selectedPaper = $('Select Best Paper for MarketAnalysis').first().json;
const technicalData = $('Technical Analysis Agent').first().json;
const marketData = $('Market Analysis Agent').first().json;
const competitiveData = $('Competitive Analysis Agent').first().json;
const ipData = $('IP Analysis Agent').first().json;
const cvsData = $('Calculate Commercial Viability Score').first().json;

// Get user email (from initial query input)
const userEmail = $input.first().json.user_email || 'demo@example.com';

// Generate unique opportunity_id
const today = new Date();
const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20251215
const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
const opportunityId = `R2M-${dateStr}-${randomSuffix}`;

// Map TRL to stage
let stage = 'Concept';
const trl = selectedPaper.trl_level || technicalData.trl_level || 0;
if (trl >= 9) stage = 'Market-Ready';
else if (trl >= 7) stage = 'Pilot';
else if (trl >= 4) stage = 'Prototype';

// Prepare research_papers data
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

// Prepare cvs_analyses data
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

// Return both datasets
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

6. **Click "Execute Node"** to test
7. **Verify output** shows `paper_data` and `analysis_data` objects

---

### Step 4: Add Node 2 - Insert Research Paper (10 minutes)

**Purpose**: Save paper to `research_papers` table

1. **Click "+" after "Prepare Supabase Insert Data"**
2. **Search for**: "Supabase" node
3. **Rename to**: `Insert Research Paper`
4. **Configure**:
   - **Credential**: Select "R2M Supabase" (from Step 1)
   - **Operation**: Insert
   - **Table**: `research_papers`
   - **Rows**: Click "Add Row" → Switch to "Expression" mode
   - **Paste**:
     ```javascript
     {{ $json.paper_data }}
     ```
   - **Return Fields**: `id` (check this box)

5. **Click "Execute Node"** to test
6. **Verify** returns `{ "id": "uuid-here" }`

---

### Step 5: Add Node 3 - Insert CVS Analysis (10 minutes)

**Purpose**: Save CVS analysis to `cvs_analyses` table

1. **Click "+" after "Insert Research Paper"**
2. **Add another "Supabase" node**
3. **Rename to**: `Insert CVS Analysis`
4. **Configure**:
   - **Credential**: R2M Supabase
   - **Operation**: Insert
   - **Table**: `cvs_analyses`
   - **Rows**: Expression mode
   - **Paste**:
     ```javascript
     {{
       {
         ...JSON.parse('{{ $("Prepare Supabase Insert Data").first().json.analysis_data }}'),
         paper_id: '{{ $("Insert Research Paper").first().json.id }}'
       }
     }}
     ```
   - **Return Fields**: `id`

5. **Click "Execute Node"**
6. **Verify** returns analysis ID

---

### Step 6: Add Node 4 - Link to User Profile (15 minutes)

**Purpose**: Connect analysis to the user who requested it

**Option A: If you have `user_email` in workflow input**

1. **Add "Supabase" node**
2. **Rename to**: `Get User Profile`
3. **Configure**:
   - **Operation**: Get
   - **Table**: `profiles`
   - **Filter by**: `email = {{ $("Prepare Supabase Insert Data").first().json.user_email }}`
   - **Return Fields**: `id`

4. **Add another "Supabase" node**
5. **Rename to**: `Update Analysis with User`
6. **Configure**:
   - **Operation**: Update
   - **Table**: `cvs_analyses`
   - **Filter by**: `id = {{ $("Insert CVS Analysis").first().json.id }}`
   - **Update Fields**:
     ```javascript
     {
       "analyzed_by": "{{ $("Get User Profile").first().json.id }}",
       "uploaded_by": "{{ $("Get User Profile").first().json.id }}"
     }
     ```

**Option B: If no user email (use demo account)**

1. **Add "Set" node**
2. **Rename to**: `Set Demo User ID`
3. **Add field**:
   - Name: `demo_user_id`
   - Value: `[Paste UUID of demo+investor_ai@gmail.com user from Supabase]`

4. **Update analysis** with this demo user ID

---

### Step 7: Add Node 5 - Success Notification (10 minutes)

**Purpose**: Log success and provide feedback

1. **Add "Function" node**
2. **Rename to**: `Log Success`
3. **Paste code**:
   ```javascript
   const analysisId = $('Insert CVS Analysis').first().json.id;
   const opportunityId = $('Prepare Supabase Insert Data').first().json.opportunity_id;
   const cvsScore = $('Prepare Supabase Insert Data').first().json.analysis_data.cvs_score;

   console.log('✅ CVS Analysis saved to Supabase!');
   console.log(`Analysis ID: ${analysisId}`);
   console.log(`Opportunity ID: ${opportunityId}`);
   console.log(`CVS Score: ${cvsScore}`);

   return [
     {
       json: {
         success: true,
         analysis_id: analysisId,
         opportunity_id: opportunityId,
         cvs_score: cvsScore,
         message: 'CVS analysis successfully saved to database',
       }
     }
   ];
   ```

4. **Click "Execute Node"**
5. **Check console** for success message

---

## ✅ Testing the Complete Flow

### Test 1: End-to-End Workflow

1. **In n8n, click "Execute Workflow"**
2. **Provide test input**:
   ```json
   {
     "query": "AI for drug discovery",
     "domain": "Healthcare",
     "user_email": "demo+investor_ai@gmail.com"
   }
   ```

3. **Wait for completion** (5-30 seconds depending on agents)

4. **Check n8n output**:
   - All nodes should be green ✅
   - "Log Success" node should show analysis ID

5. **Verify in Supabase**:
   - Go to Supabase Dashboard → Table Editor
   - Check `research_papers` table → 1 new row
   - Check `cvs_analyses` table → 1 new row
   - Verify `cvs_score`, `tam`, `trl` are populated

### Test 2: Check Marketplace Display

1. **Open your R2M marketplace**: `http://localhost:3000/marketplace`
2. **Currently shows**: 6 mock opportunities ❌
3. **After n8n integration**: Should show real analyses ✅

**To connect marketplace to real data** (do this after n8n works):

Edit `src/app/marketplace/page.tsx`:
```typescript
// Replace mockOpportunities with:
const [opportunities, setOpportunities] = useState([])

useEffect(() => {
  const fetchOpportunities = async () => {
    const { data } = await supabase
      .from('cvs_analyses')
      .select(`
        *,
        research_papers(title, authors, abstract)
      `)
      .eq('status', 'completed')
      .order('cvs_score', { ascending: false })
      .limit(20)

    setOpportunities(data || [])
  }
  fetchOpportunities()
}, [])
```

---

## 🐛 Troubleshooting

### Issue 1: "Supabase authentication failed"
**Cause**: Wrong service_role key

**Fix**:
- Go to Supabase Dashboard → Settings → API
- Copy **service_role** key (NOT anon key)
- Update n8n credential

### Issue 2: "Column does not exist"
**Cause**: Migration 009 or 010 not run

**Fix**:
- Open Supabase SQL Editor
- Run `supabase/migrations/009_add_researcher_connections.sql`
- Run `supabase/migrations/010_add_profile_jsonb_column.sql`

### Issue 3: "User not found"
**Cause**: `user_email` doesn't exist in `profiles` table

**Fix**:
- Run `supabase/seed_investors_YOUR_EMAIL.sql` to create test users
- Or use demo account UUID directly

### Issue 4: "Foreign key violation"
**Cause**: `paper_id` or `analyzed_by` doesn't match

**Fix**:
- Check "Insert Research Paper" returns valid UUID
- Check "Get User Profile" returns valid UUID
- Verify `research_papers.id` exists before inserting analysis

### Issue 5: n8n workflow times out
**Cause**: Long-running analysis (30+ seconds)

**Fix**:
- Increase n8n timeout: Settings → Executions → Timeout (set to 120s)
- Or run in background mode

---

## 📊 Success Criteria

After completing all steps, you should have:

- [x] 5 new nodes added to n8n orchestrator
- [x] Test workflow executes without errors
- [x] `research_papers` table has 1+ rows
- [x] `cvs_analyses` table has 1+ rows
- [x] CVS scores visible in Supabase
- [x] Analysis linked to user profile
- [x] Ready to connect marketplace UI to real data

**Next step**: Update marketplace page to fetch real analyses (5-line code change)

---

## 🎯 What This Unlocks

**Before integration**:
- ❌ n8n analysis results only sent via email
- ❌ Marketplace shows 6 hardcoded opportunities
- ❌ No way to publish analyses
- ❌ No investor can see real CVS scores

**After integration**:
- ✅ Analysis results automatically save to database
- ✅ Marketplace can show real opportunities
- ✅ Users can publish/unpublish listings
- ✅ Investors see live CVS scores
- ✅ Foundation for Steps 3-6 (matching, connections, deals)

---

## 🚀 Quick Start Commands

**In n8n**:
```bash
# If self-hosting n8n locally:
npm start n8n

# Access at: http://localhost:5678
```

**In Supabase**:
```sql
-- Verify tables exist
SELECT COUNT(*) FROM research_papers;
SELECT COUNT(*) FROM cvs_analyses;

-- Check recent analyses
SELECT title, cvs_score, created_at
FROM cvs_analyses
ORDER BY created_at DESC
LIMIT 10;
```

---

**Estimated Time**: 1.5-2 hours
**Difficulty**: Intermediate
**Help**: Refer to `N8N_SUPABASE_INTEGRATION_GUIDE.md` for detailed data mapping

**Ready to start?** Open n8n and begin with Step 1! 🚀
