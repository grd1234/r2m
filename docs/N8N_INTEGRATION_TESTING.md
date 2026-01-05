# n8n Webhook Integration - Testing Guide

## Overview

The CVS Analysis feature now uses the **n8n workflow** instead of calling Claude API directly from Next.js. This provides better workflow orchestration, logging, and database management.

---

## Architecture Flow

```
User Interface (Next.js)
  ↓
  Submit query on /analysis/search
  ↓
Next.js API (/api/analysis/run)
  ↓
  Trigger n8n webhook
  ↓
n8n Workflow (https://geetad4321.app.n8n.cloud/webhook/research-to-market/start)
  ↓
  00 - User Query Input & Validation
  ↓
  01 - Discovery Agent (Semantic Scholar search)
  ↓
  02 - Orchestrator Agent
  ↓
  03 - Technical Validation Agent
  ↓
  04 - Market Sizing Agent
  ↓
  05 - Competitive Analysis Agent
  ↓
  06 - IP Analysis Agent
  ↓
  Calculate CVS Score
  ↓
  Insert CVS Analysis into DB (cvs_analyses table)
  ↓
Database (Supabase)
  ↓
UI polls and displays results
```

---

## Configuration

### Environment Variables

**File:** `/r2m-marketplace/.env.local`

```bash
# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://geetad4321.app.n8n.cloud/webhook/research-to-market/start
```

✅ Already configured
✅ Server automatically reloaded

---

## Code Changes

### 1. New n8n Integration Module

**File:** `src/lib/ai/n8n-workflow.ts`

**Purpose:** Handles communication with n8n webhook

**Key function:**
```typescript
triggerN8nWorkflow(request: N8nWorkflowRequest): Promise<N8nWorkflowResponse>
```

**Request payload:**
```typescript
{
  query: string              // Research query
  user_email?: string        // User's email
  domain?: string            // Research domain (default: "Computer Science")
  num_papers?: number        // Number of papers to analyze (default: 5)
  max_papers?: number        // Max papers (default: 5)
  min_citations?: number     // Min citation count (default: 0)
  min_year?: number          // Min publication year (default: 2015)
}
```

---

### 2. Updated API Route

**File:** `src/app/api/analysis/run/route.ts`

**Changes:**
- Removed direct Claude API calls
- Added n8n webhook trigger
- Workflow handles database inserts (not Next.js)

**Flow:**
1. Fetch analysis record from `cvs_analyses` (created by UI)
2. Get user email
3. Trigger n8n webhook with query
4. n8n workflow processes and inserts results
5. UI polls database for updates

---

## Testing Steps

### Step 1: Open the Application

✅ Already running at: **http://localhost:3000/analysis/search**

---

### Step 2: Submit a Test Query

**Test queries:**
1. "Quantum computing for drug discovery"
2. "CRISPR gene editing applications"
3. "AI-powered defect detection for manufacturing"

**Actions:**
1. Type query in search box
2. Click "Analyze Research"
3. Should redirect to `/analysis/results/{id}` with processing state

---

### Step 3: Monitor n8n Workflow

**n8n Dashboard:** https://geetad4321.app.n8n.cloud

**What to check:**
1. Workflow execution starts
2. Each agent completes successfully:
   - User Query Input
   - Discovery Agent
   - Orchestrator
   - Technical Validation
   - Market Sizing
   - Competitive Analysis
   - IP Analysis
   - Calculate CVS Score
   - **Insert CVS Analysis** (new!)

---

### Step 4: Check Backend Logs

**Terminal output from dev server:**

```bash
=== CVS Analysis API called ===
Analysis ID: {uuid}
Supabase client created
Fetching analysis record...
Analysis found: {query}
Triggering n8n workflow...
n8n workflow result: { status: 'success', workflow_id: '...' }
=== n8n workflow triggered successfully ===
Note: CVS analysis data will be inserted by n8n workflow
```

---

### Step 5: Verify Database Updates

The n8n workflow should insert data into:

**Table:** `cvs_analyses`

**Fields inserted by n8n:**
- `paper_id` - Foreign key to research_papers
- `analyzed_by` - User UUID
- `cvs_score` - 0-100 score
- `cvs_tier` - "Excellent", "Strong", "Moderate", "Weak", "Poor"
- `recommendation` - Text recommendation
- `technical_score` - Weighted total
- `market_score` - Weighted total
- `competitive_score` - Weighted total
- `ip_score` - IP opportunity score
- `market_size_tam` - TAM in billions
- `market_readiness_score` - 0-10
- `trl_level` - 1-9
- `feasibility_score` - 0-10
- `analysis_notes` - Full JSON

**Query to check:**
```sql
SELECT
  ca.id,
  ca.cvs_score,
  ca.cvs_tier,
  rp.title,
  p.email
FROM cvs_analyses ca
JOIN research_papers rp ON ca.paper_id = rp.id
JOIN profiles p ON ca.analyzed_by = p.id
ORDER BY ca.created_at DESC
LIMIT 5;
```

---

### Step 6: Verify UI Display

**Results page should show:**

✅ CVS Score Hero (0-100 with color coding)
✅ Score Breakdown:
  - Technical Score (with progress bar)
  - Market Score (with progress bar)
  - IP Strength (with progress bar)
  - TRL (1-9)
✅ TAM (Total Addressable Market)
✅ Summary
✅ Recommendations

---

## Expected Behavior

### Processing State (0-30 seconds)

**UI shows:**
- Animated loader
- "Analyzing Research" message
- Progress checklist
- Polls every 3 seconds

---

### Completed State

**UI shows:**
- Full CVS score analysis
- All score breakdowns
- Market data
- Summary and recommendations
- Action buttons

---

## Troubleshooting

### Issue 1: Webhook Returns 404

**Symptom:** n8n workflow not triggered

**Check:**
1. n8n workflow is activated
2. Webhook URL is correct in `.env.local`
3. Webhook path is `/research-to-market/start`

---

### Issue 2: Workflow Starts But No DB Insert

**Symptom:** Data not appearing in `cvs_analyses` table

**Check:**
1. n8n workflow has "Insert CVS Analysis" node
2. Node is positioned after "Calculate CVS Score"
3. Database credentials are configured in n8n

**Verify node exists:**
- Open n8n workflow "02 - Orchestrator Agent"
- Check for nodes:
  - "Get User ID for CVS"
  - "Insert CVS Analysis"

---

### Issue 3: UI Shows "Processing" Forever

**Symptom:** Polling never completes

**Possible causes:**
1. n8n workflow failed (check n8n logs)
2. CVS data not inserted (check database)
3. Status not updated to 'completed'

**Debug query:**
```sql
SELECT id, query, status, created_at
FROM cvs_analyses
ORDER BY created_at DESC
LIMIT 5;
```

---

## Data Flow Comparison

### Before (Direct Claude API)

```
UI → Next.js API → Claude API → Parse Results → Insert DB → UI displays
```

**Issues:**
- All processing in Next.js
- Complex error handling
- No workflow visibility
- Hard to debug

---

### After (n8n Workflow)

```
UI → Next.js API → n8n Webhook → Multi-Agent Workflow → Insert DB → UI displays
```

**Benefits:**
✅ Better orchestration
✅ Comprehensive logging in n8n
✅ Each agent specialized
✅ Database management in workflow
✅ Easy to monitor and debug
✅ Workflow can be updated without code changes

---

## Next Steps

1. **Test with multiple queries** to verify consistency
2. **Monitor n8n executions** for any errors
3. **Check database** for correct data insertion
4. **Verify UI** displays all fields correctly
5. **Test error scenarios** (invalid query, network issues)

---

## Key Files Modified

```
✅ .env.local                              - Added N8N_WEBHOOK_URL
✅ src/lib/ai/n8n-workflow.ts              - New n8n integration module
✅ src/app/api/analysis/run/route.ts       - Updated to use n8n webhook
```

---

## Important Notes

⚠️ **The UI creates the initial record** in `cvs_analyses` with `status='processing'`

⚠️ **The n8n workflow updates the record** with all CVS data and `status='completed'`

⚠️ **The UI polls** the database every 3 seconds until status changes

---

**Ready to test! Try submitting a query now.** 🚀
