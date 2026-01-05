# Technical Analysis Storage Setup Guide
**Date:** December 29, 2025
**Purpose:** Configure n8n Postgres node to store technical analysis results
**Estimated Time:** 15-20 minutes

---

## Overview

This guide shows you how to configure the n8n Postgres INSERT node to store complete technical analysis results in the `technical_analyses` table.

**What you'll store:**
- Aggregated scores (technical score, TRL level, feasibility rating)
- Structured data (executive summary, paper details, recommendations)
- Formatted HTML report (ready to send via email)
- Metadata (query, domain, workflow ID, user email)

---

## Prerequisites

- ✅ `technical_analyses` table exists in Supabase
- ✅ n8n workflow has "Aggregate Results" node
- ✅ n8n workflow has "Format Technical Analysis HTML" node
- ✅ Supabase connection configured in n8n

---

## Step-by-Step: Configure SQL INSERT with Individual Parameters

### **Step 1: Open the Postgres Node**

1. Click on your **"Execute a SQL query"** node (or create new Postgres node)
2. Rename it to: **"Store Technical Analysis Results"**
3. Make sure **Credential to connect with** is set to your Supabase connection

---

### **Step 2: Set the Operation**

1. **Operation:** Select **"Insert"**
2. **Schema:** Enter `public`
3. **Table:** Enter `technical_analyses`

---

### **Step 3: Add Columns and Values**

Click **"Add Column"** 18 times, then fill in each column as follows:

**Important:** For each value, click the **expression icon (ƒx)** to enable expression mode before entering the expression.

---

#### **Column 1: analysis_id**
- **Column:** `analysis_id`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.executive_summary.analysis_id }}
  ```

---

#### **Column 2: overall_technical_score**
- **Column:** `overall_technical_score`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.statistics.avg_technical_score || 0 }}
  ```

---

#### **Column 3: overall_trl_level**
- **Column:** `overall_trl_level`
- **Value:** (Expression mode)
  ```
  {{ Math.round($('Aggregate Results').item.json.statistics.avg_trl || 5) }}
  ```

---

#### **Column 4: overall_feasibility_rating**
- **Column:** `overall_feasibility_rating`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.statistics.avg_feasibility >= 7 ? 'High' : $('Aggregate Results').item.json.statistics.avg_feasibility >= 4 ? 'Medium' : 'Low' }}
  ```

---

#### **Column 5: avg_trl**
- **Column:** `avg_trl`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.statistics.avg_trl }}
  ```

---

#### **Column 6: avg_feasibility**
- **Column:** `avg_feasibility`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.statistics.avg_feasibility }}
  ```

---

#### **Column 7: executive_summary**
- **Column:** `executive_summary`
- **Value:** (Expression mode)
  ```
  {{ JSON.stringify($('Aggregate Results').item.json.executive_summary) }}
  ```

---

#### **Column 8: papers_detailed**
- **Column:** `papers_detailed`
- **Value:** (Expression mode)
  ```
  {{ JSON.stringify($('Aggregate Results').item.json.papers_detailed || []) }}
  ```

---

#### **Column 9: comparison_table**
- **Column:** `comparison_table`
- **Value:** (Expression mode)
  ```
  {{ JSON.stringify($('Aggregate Results').item.json.comparison_table || []) }}
  ```

---

#### **Column 10: recommendations_by_use_case**
- **Column:** `recommendations_by_use_case`
- **Value:** (Expression mode)
  ```
  {{ JSON.stringify($('Aggregate Results').item.json.recommendations_by_use_case || {}) }}
  ```

---

#### **Column 11: statistics**
- **Column:** `statistics`
- **Value:** (Expression mode)
  ```
  {{ JSON.stringify($('Aggregate Results').item.json.statistics || {}) }}
  ```

---

#### **Column 12: html_report**
- **Column:** `html_report`
- **Value:** (Expression mode)
  ```
  {{ $json.htmlEmail }}
  ```
  **Note:** This comes from the current node's input (Format Technical Analysis HTML node output)

---

#### **Column 13: plain_text_summary**
- **Column:** `plain_text_summary`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.executive_summary.summary || '' }}
  ```

---

#### **Column 14: papers_analyzed**
- **Column:** `papers_analyzed`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.executive_summary.total_papers_analyzed || 0 }}
  ```

---

#### **Column 15: query**
- **Column:** `query`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.executive_summary.query || '' }}
  ```

---

#### **Column 16: domain**
- **Column:** `domain`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.executive_summary.domain || '' }}
  ```

---

#### **Column 17: workflow_id**
- **Column:** `workflow_id`
- **Value:** (Expression mode)
  ```
  {{ $('Aggregate Results').item.json.executive_summary.workflow_id || $execution.id }}
  ```

---

#### **Column 18: user_email**
- **Column:** `user_email`
- **Value:** (Expression mode)
  ```
  {{ $json.user_email || $('Aggregate Results').item.json.executive_summary.user_email || '' }}
  ```

---

### **Step 4: Configure Upsert Behavior (ON CONFLICT)**

Scroll down to **"Options"** section and expand it:

1. Click **"Add Option"**
2. Select **"On Conflict"**
3. **On Conflict:** Select **"Update"** (or enter `UPDATE`)
4. **Conflict Columns:** Enter `analysis_id`
5. **Skip on Conflict:** Leave unchecked

This ensures that if you run the workflow twice with the same analysis_id, it will UPDATE the existing row instead of failing.

---

### **Step 5: Node Connections**

Make sure the node flow is:

```
Aggregate Results
  │
  └─► Format Technical Analysis HTML
        │
        └─► Store Technical Analysis Results (this node)
              │
              └─► Log Agent Completed
```

---

### **Step 6: Test the Node**

1. Click **"Execute Node"** (test button with play icon)
2. Check the output panel on the right
3. You should see the inserted row data with all fields
4. If there's an error, check the error message to see which column failed

---

### **Step 7: Verify in Supabase**

1. Go to **Supabase Dashboard**
2. Navigate to **Table Editor**
3. Select **`technical_analyses`** table
4. You should see a new row with:
   - `analysis_id` populated
   - `overall_technical_score`, `avg_trl`, etc. with numeric values
   - `executive_summary`, `papers_detailed`, etc. with JSONB data
   - `html_report` with full HTML content
   - `created_at` timestamp

---

## Quick Reference Table

| # | Column | Source Node | Expression |
|---|--------|-------------|------------|
| 1 | analysis_id | Aggregate Results | `{{ $('Aggregate Results').item.json.executive_summary.analysis_id }}` |
| 2 | overall_technical_score | Aggregate Results | `{{ $('Aggregate Results').item.json.statistics.avg_technical_score \|\| 0 }}` |
| 3 | overall_trl_level | Aggregate Results | `{{ Math.round($('Aggregate Results').item.json.statistics.avg_trl \|\| 5) }}` |
| 4 | overall_feasibility_rating | Aggregate Results | `{{ $('Aggregate Results').item.json.statistics.avg_feasibility >= 7 ? 'High' : $('Aggregate Results').item.json.statistics.avg_feasibility >= 4 ? 'Medium' : 'Low' }}` |
| 5 | avg_trl | Aggregate Results | `{{ $('Aggregate Results').item.json.statistics.avg_trl }}` |
| 6 | avg_feasibility | Aggregate Results | `{{ $('Aggregate Results').item.json.statistics.avg_feasibility }}` |
| 7 | executive_summary | Aggregate Results | `{{ JSON.stringify($('Aggregate Results').item.json.executive_summary) }}` |
| 8 | papers_detailed | Aggregate Results | `{{ JSON.stringify($('Aggregate Results').item.json.papers_detailed \|\| []) }}` |
| 9 | comparison_table | Aggregate Results | `{{ JSON.stringify($('Aggregate Results').item.json.comparison_table \|\| []) }}` |
| 10 | recommendations_by_use_case | Aggregate Results | `{{ JSON.stringify($('Aggregate Results').item.json.recommendations_by_use_case \|\| {}) }}` |
| 11 | statistics | Aggregate Results | `{{ JSON.stringify($('Aggregate Results').item.json.statistics \|\| {}) }}` |
| 12 | html_report | Current node input | `{{ $json.htmlEmail }}` |
| 13 | plain_text_summary | Aggregate Results | `{{ $('Aggregate Results').item.json.executive_summary.summary \|\| '' }}` |
| 14 | papers_analyzed | Aggregate Results | `{{ $('Aggregate Results').item.json.executive_summary.total_papers_analyzed \|\| 0 }}` |
| 15 | query | Aggregate Results | `{{ $('Aggregate Results').item.json.executive_summary.query \|\| '' }}` |
| 16 | domain | Aggregate Results | `{{ $('Aggregate Results').item.json.executive_summary.domain \|\| '' }}` |
| 17 | workflow_id | Aggregate Results | `{{ $('Aggregate Results').item.json.executive_summary.workflow_id \|\| $execution.id }}` |
| 18 | user_email | Current node input | `{{ $json.user_email \|\| $('Aggregate Results').item.json.executive_summary.user_email \|\| '' }}` |

---

## Data Flow Summary

| Data Type | Source | Access Pattern |
|-----------|--------|----------------|
| Structured data (summaries, papers, stats) | Aggregate Results node | `$('Aggregate Results').item.json.*` |
| Formatted HTML email | Format Technical Analysis HTML node | `$json.htmlEmail` |
| User email | Format Technical Analysis HTML node | `$json.user_email` |

---

## Troubleshooting

### **Error: "Node 'Aggregate Results' not found"**

**Solution:** Check that the node name is exactly **"Aggregate Results"** (case-sensitive). If your node has a different name, update all `$('Aggregate Results')` references.

---

### **Error: "Cannot read property 'analysis_id' of undefined"**

**Solution:**
1. Execute the **Aggregate Results** node first to verify it produces output
2. Check the output structure - expand `executive_summary` to see if `analysis_id` exists
3. If the structure is different, update the expression accordingly

---

### **Error: "invalid input syntax for type uuid"**

**Solution:**
1. Make sure the expression icon (ƒx) is enabled for the `analysis_id` field
2. Verify that `analysis_id` in Aggregate Results output is a valid UUID
3. Check that you're using `{{ }}` around the expression

---

### **Error: "null value in column 'analysis_id' violates not-null constraint"**

**Solution:**
1. The `analysis_id` is not being passed from Aggregate Results
2. Check that your Aggregate Results node includes `analysis_id` in its output
3. You may need to add it earlier in the workflow (e.g., from the orchestrator trigger)

---

### **Some columns are null when they shouldn't be**

**Solution:**
1. Execute the **Aggregate Results** node and inspect its output
2. Check the exact JSON path to the data you need
3. Update the expressions to match the actual data structure
4. Use `|| ''` or `|| 0` for fallback values

---

## Expression Mode Tips

### **How to enable Expression Mode:**
1. Click the field where you want to enter the value
2. Look for **ƒx** icon or **"Expression"** toggle
3. Click it to switch from fixed value to expression
4. The field background usually changes color (often light blue/purple)
5. Now you can enter `{{ }}` expressions

### **Common Expression Patterns:**

**Get a value with fallback:**
```javascript
{{ $json.field_name || 'default_value' }}
```

**Convert object to JSON string:**
```javascript
{{ JSON.stringify($json.object_field) }}
```

**Conditional value:**
```javascript
{{ $json.score >= 7 ? 'High' : 'Low' }}
```

**Math operation:**
```javascript
{{ Math.round($json.decimal_value) }}
```

**Access nested object:**
```javascript
{{ $('Node Name').item.json.parent.child.field }}
```

---

## Testing Checklist

Before considering this complete:

- [ ] All 18 columns configured with expressions
- [ ] ON CONFLICT set to UPDATE on `analysis_id`
- [ ] Test execution succeeds
- [ ] Row appears in Supabase `technical_analyses` table
- [ ] `html_report` column contains full HTML
- [ ] `executive_summary`, `papers_detailed`, etc. contain JSONB data
- [ ] `overall_technical_score`, `avg_trl` have numeric values
- [ ] Re-running with same `analysis_id` updates instead of duplicating

---

## Next Steps

After configuring this node:

1. **Update CVS Analysis Table** - Add a separate node to update `cvs_analyses.technical_score`
2. **Test Full Workflow** - Run end-to-end from discovery through technical analysis
3. **Add to Other Agents** - Create similar storage for Market, Competitive, IP analyses
4. **Frontend Integration** - Query this table to display technical analysis in UI
5. **Email Integration** - Read `html_report` from this table in orchestrator for sending emails

---

## Related Documentation

- `LANGGRAPH_PROGRESS_QUICK_START.md` - Progress visualization setup
- `N8N_PROGRESS_LOGGING_GUIDE.md` - Activity logging configuration
- Database schema in Supabase → Table Editor → `technical_analyses`

---

**Questions or issues?** Check the troubleshooting section above or review the Aggregate Results node output to verify data structure.
