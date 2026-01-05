# n8n Progress Logging Configuration Guide
**Date:** December 28, 2025
**Purpose:** Update n8n workflows to log progress for real-time visualization
**Estimated Time:** 1-2 hours

---

## Overview

This guide shows you how to add progress logging to your existing n8n CVS workflows so that users can see real-time progress in the frontend.

**What you'll add:**
- "Agent Started" log at the beginning of each workflow
- "Agent In Progress" logs during long operations (optional)
- "Agent Completed" log at the end with results
- "Agent Failed" log on error

---

## Prerequisites

- ✅ Supabase connection configured in n8n
- ✅ `user_activities` table exists in Supabase
- ✅ You have access to your n8n workflows

---

## Step-by-Step: Adding Logging to Each Agent

### **Pattern for Every Agent Workflow:**

```
START
  │
  ├─► Log "Agent Started"
  │
  ├─► Do actual work (search papers, analyze, etc.)
  │   │
  │   └─► (Optional) Log "In Progress" updates
  │
  ├─► Log "Agent Completed" (on success)
  │
  └─► Log "Agent Failed" (on error)
```

---

## Example 1: Discovery Agent (Paper Search)

**Workflow:** `01 - discoveryAgent - v3.0.json`

### **Node 1: Log Agent Started**

**Node Type:** `HTTP Request`
**Name:** `Log Discovery Started`
**Position:** Right after workflow trigger

**Configuration:**
```json
{
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "supabaseApi",
  "url": "={{ $('Supabase Credentials').item.json.url }}/rest/v1/user_activities",
  "method": "POST",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "apikey",
        "value": "={{ $('Supabase Credentials').item.json.anon_key }}"
      },
      {
        "name": "Authorization",
        "value": "=Bearer {{ $('Supabase Credentials').item.json.anon_key }}"
      },
      {
        "name": "Content-Type",
        "value": "application/json"
      },
      {
        "name": "Prefer",
        "value": "return=minimal"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "user_id",
        "value": "={{ $json.user_id }}"
      },
      {
        "name": "activity_type",
        "value": "cvs_analysis_step"
      },
      {
        "name": "description",
        "value": "Discovery Agent started"
      },
      {
        "name": "metadata",
        "value": "={{ JSON.stringify({\n  analysis_id: $json.analysis_id,\n  agent: 'discovery',\n  status: 'started',\n  progress: 0,\n  started_at: new Date().toISOString()\n}) }}"
      }
    ]
  }
}
```

**Simplified Body (if using JSON mode):**
```json
{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Discovery Agent started",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "discovery",
    "status": "started",
    "progress": 0,
    "started_at": "{{ $now.toISO() }}"
  }
}
```

---

### **Node 2: Search Semantic Scholar (existing work)**

Keep your existing Semantic Scholar API call node.

---

### **Node 3: (Optional) Log Progress Update**

**Node Type:** `HTTP Request`
**Name:** `Log Discovery Progress`
**When:** After you've found some papers but still processing

```json
{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Discovery Agent - found papers, now ranking",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "discovery",
    "status": "in_progress",
    "progress": 50,
    "current_step": "Ranking {{ $json.papers_found }} papers by relevance"
  }
}
```

---

### **Node 4: Log Agent Completed**

**Node Type:** `HTTP Request`
**Name:** `Log Discovery Completed`
**Position:** After all discovery work is done

```json
{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Discovery Agent completed",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "discovery",
    "status": "completed",
    "progress": 100,
    "started_at": "{{ $('Log Discovery Started').item.json.metadata.started_at }}",
    "papers_found": "{{ $json.selected_papers.length }}",
    "top_paper": "{{ $json.selected_papers[0].title }}"
  }
}
```

---

### **Node 5: Error Handler - Log Agent Failed**

**Node Type:** `HTTP Request`
**Name:** `Log Discovery Failed`
**Position:** In error handling branch

```json
{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Discovery Agent failed",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "discovery",
    "status": "failed",
    "error": "{{ $json.error.message }}",
    "started_at": "{{ $('Log Discovery Started').item.json.metadata.started_at }}"
  }
}
```

---

## Example 2: Technical Validation Agent

**Workflow:** `03 - Technical Validation Agent v2.5.json`

### **Critical Logging Points:**

**1. At Start:**
```json
{
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "technical",
    "status": "started",
    "progress": 0
  }
}
```

**2. During GPT-4 Analysis (optional):**
```json
{
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "technical",
    "status": "in_progress",
    "progress": 50,
    "current_step": "Analyzing TRL level and feasibility"
  }
}
```

**3. At Completion:**
```json
{
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "technical",
    "status": "completed",
    "progress": 100,
    "score": "{{ $json.technical_score }}",
    "trl_level": "{{ $json.trl_level }}"
  }
}
```

---

## Example 3: Market Sizing Agent

**Workflow:** `04 - Market Sizing Agent - v2.5.json`

### **Logging Configuration:**

**At Start:**
```json
{
  "description": "Market Sizing Agent started",
  "metadata": {
    "agent": "market",
    "status": "started",
    "progress": 0
  }
}
```

**After TAM Calculation:**
```json
{
  "description": "Market Sizing Agent - TAM calculated",
  "metadata": {
    "agent": "market",
    "status": "in_progress",
    "progress": 60,
    "current_step": "Calculated TAM: ${{ $json.tam_billions }}B"
  }
}
```

**At Completion:**
```json
{
  "description": "Market Sizing Agent completed",
  "metadata": {
    "agent": "market",
    "status": "completed",
    "progress": 100,
    "tam": "{{ $json.tam_billions }}",
    "sam": "{{ $json.sam_billions }}",
    "cagr": "{{ $json.cagr_percent }}"
  }
}
```

---

## Example 4: Competitive Analysis Agent

**Workflow:** `05 - Competitive Analysis Agent - v2.5.json`

```json
// Started
{
  "metadata": {
    "agent": "competitive",
    "status": "started",
    "progress": 0
  }
}

// In Progress
{
  "metadata": {
    "agent": "competitive",
    "status": "in_progress",
    "progress": 40,
    "current_step": "Analyzing competitors and barriers to entry"
  }
}

// Completed
{
  "metadata": {
    "agent": "competitive",
    "status": "completed",
    "progress": 100,
    "competitors_found": "{{ $json.competitors.length }}",
    "competitive_score": "{{ $json.competitive_score }}"
  }
}
```

---

## Example 5: IP Analysis Agent

**Workflow:** `06 - ip_analysis_agent - v2.5.json`

```json
// Started
{
  "metadata": {
    "agent": "ip",
    "status": "started",
    "progress": 0
  }
}

// During Patent Search
{
  "metadata": {
    "agent": "ip",
    "status": "in_progress",
    "progress": 70,
    "current_step": "Searching {{ $json.patent_count }} related patents"
  }
}

// Completed
{
  "metadata": {
    "agent": "ip",
    "status": "completed",
    "progress": 100,
    "patents_found": "{{ $json.patent_count }}",
    "ip_strength": "{{ $json.ip_score }}"
  }
}
```

---

## Example 6: Business Strategy Agent

**Workflow:** `07_business_strategy_agent.json`

```json
// Started
{
  "metadata": {
    "agent": "strategy",
    "status": "started",
    "progress": 0
  }
}

// Completed
{
  "metadata": {
    "agent": "strategy",
    "status": "completed",
    "progress": 100,
    "recommendations_generated": true
  }
}
```

---

## Example 7: Final Report Generation

**In Orchestrator Workflow:** `02 - Orchestrator Agent - v3.0.json`

**After all agents complete, before sending email:**

```json
// Report Started
{
  "metadata": {
    "agent": "report",
    "status": "started",
    "progress": 0
  }
}

// Report Completed
{
  "metadata": {
    "agent": "report",
    "status": "completed",
    "progress": 100,
    "cvs_score": "{{ $json.final_cvs_score }}",
    "report_sent": true
  }
}
```

---

## Quick Reference: Agent IDs

Use these exact agent IDs for consistency with the frontend:

| Workflow | Agent ID | Name |
|----------|----------|------|
| User Query Input | `validation` | Query Validation |
| Discovery Agent | `discovery` | Discovery Agent |
| Technical Validation | `technical` | Technical Validation |
| Market Sizing | `market` | Market Sizing |
| Competitive Analysis | `competitive` | Competitive Analysis |
| IP Analysis | `ip` | IP Analysis |
| Business Strategy | `strategy` | Business Strategy |
| Final Report | `report` | Final Report |

---

## Testing Your Logging

### **Step 1: Submit a Test Query**
```bash
# Submit a query through your form
# Note the analysis_id from the response
```

### **Step 2: Check Supabase Logs**
```sql
-- In Supabase SQL Editor
SELECT
  created_at,
  description,
  metadata->>'agent' as agent,
  metadata->>'status' as status,
  metadata->>'progress' as progress
FROM user_activities
WHERE metadata->>'analysis_id' = 'YOUR_ANALYSIS_ID'
ORDER BY created_at ASC;
```

**Expected Output:**
```
2025-12-28 10:00:00 | Query validation started      | validation  | started    | 0
2025-12-28 10:00:02 | Query validation completed    | validation  | completed  | 100
2025-12-28 10:00:03 | Discovery Agent started       | discovery   | started    | 0
2025-12-28 10:00:45 | Discovery Agent completed     | discovery   | completed  | 100
2025-12-28 10:00:46 | Technical Validation started  | technical   | started    | 0
2025-12-28 10:01:10 | Technical Validation completed| technical   | completed  | 100
...
```

### **Step 3: Test Frontend**
```bash
# Navigate to: http://localhost:3000/analysis/results/YOUR_ANALYSIS_ID
# You should see the progress graph updating in real-time
```

---

## Common Issues & Solutions

### **Issue 1: Logs not appearing**

**Symptoms:** No activity logs in Supabase

**Solutions:**
1. Check Supabase API credentials in n8n
2. Verify `user_activities` table exists
3. Check RLS policies allow INSERT
4. Look at n8n execution logs for HTTP errors

**Fix RLS Policy:**
```sql
-- Allow authenticated users to insert their own activities
CREATE POLICY "Users can insert own activities"
ON user_activities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Or temporarily disable RLS for testing
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
```

---

### **Issue 2: Metadata not parsing correctly**

**Symptoms:** `metadata` column shows as string instead of JSON

**Solution:** Ensure you're using `JSON.stringify()` in n8n:

```javascript
// In n8n expression
={{ JSON.stringify({
  analysis_id: $json.analysis_id,
  agent: 'discovery',
  status: 'started'
}) }}
```

---

### **Issue 3: Frontend not showing real-time updates**

**Symptoms:** Progress graph stays at 0% or doesn't update

**Solutions:**
1. Check API endpoint is accessible: `GET /api/analysis/[id]/progress`
2. Verify `analysis_id` matches between n8n and frontend
3. Check browser console for errors
4. Ensure polling is enabled (should poll every 2 seconds)

**Debug API Response:**
```bash
curl http://localhost:3000/api/analysis/YOUR_ID/progress
```

---

### **Issue 4: Wrong agent order**

**Symptoms:** Agents appear in wrong sequence in UI

**Solution:** Ensure agent IDs match exactly:
```typescript
// In route.ts, AGENT_DEFINITIONS must match your workflow order
const AGENT_DEFINITIONS = [
  { id: 'validation', name: 'Query Validation' },
  { id: 'discovery', name: 'Discovery Agent' },
  { id: 'technical', name: 'Technical Validation' },
  // ... order matters!
];
```

---

## Performance Considerations

**Logging overhead per agent:**
- HTTP request to Supabase: ~50-100ms
- Negligible compared to agent execution time (20-30 seconds each)

**Total overhead for 8 agents:**
- Started logs: 8 × 100ms = 800ms
- Completed logs: 8 × 100ms = 800ms
- **Total: ~1.6 seconds** (< 1% of 3-minute analysis)

**Recommendation:**
- Add START and COMPLETED logs (required)
- Skip IN_PROGRESS logs for fast agents (< 10 seconds)
- Add IN_PROGRESS logs for slow agents (> 20 seconds) like Discovery, Technical, Market

---

## Validation Checklist

Before considering this feature complete:

- [ ] All 8 agent workflows have "started" logs
- [ ] All 8 agent workflows have "completed" logs
- [ ] Agent IDs match between n8n and frontend code
- [ ] Error handlers log "failed" status
- [ ] Tested with real query end-to-end
- [ ] Frontend shows real-time progress updates
- [ ] Progress graph displays correctly on mobile
- [ ] Logs include meaningful metadata (scores, counts, etc.)
- [ ] RLS policies allow logging from n8n service account
- [ ] Demo script prepared showing live progress

---

## Next Steps

1. **Week 1:** Add logging to 2-3 workflows (Discovery, Technical, Market)
2. **Week 2:** Add logging to remaining workflows
3. **Week 3:** Test end-to-end with real queries
4. **Week 4:** Polish UI animations and demo

**Time estimate:** 1-2 hours per workflow = 8-16 hours total

---

## Example: Complete Discovery Agent with Logging

Here's what a complete Discovery Agent workflow looks like with logging:

```
START
  │
  ├─► [HTTP Request] Log Discovery Started
  │     └─► Body: { agent: 'discovery', status: 'started' }
  │
  ├─► [HTTP Request] Search Semantic Scholar
  │     └─► Query papers
  │
  ├─► [Function] Process Results
  │     └─► Filter and rank papers
  │
  ├─► [HTTP Request] Log Discovery Progress (optional)
  │     └─► Body: { agent: 'discovery', status: 'in_progress', progress: 50 }
  │
  ├─► [Function] Select Top Papers
  │     └─► Pick 2-20 best papers
  │
  ├─► [HTTP Request] Log Discovery Completed
  │     └─► Body: { agent: 'discovery', status: 'completed', papers_found: 10 }
  │
  └─► [Error Handler] Log Discovery Failed (on error)
        └─► Body: { agent: 'discovery', status: 'failed', error: 'message' }
```

---

**Ready to implement? Start with one workflow, test it, then replicate to others!**
