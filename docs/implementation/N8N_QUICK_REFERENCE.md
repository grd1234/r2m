# n8n Integration Quick Reference Card

**Print this page for quick reference while implementing!**

---

## ⚡ 5-Minute Setup Checklist

```
□ Open n8n workflow: "00 - Orchestrator Agent_emailFixed"
□ Navigate to last node: "Send Email Report"
□ Have Supabase credentials ready
□ Have code snippets document open
□ Clear 1.5-2 hours of uninterrupted time
```

---

## 🎯 Node Summary Table

| # | Node Name | Type | Purpose | Time |
|---|-----------|------|---------|------|
| 1 | Prepare Supabase Insert Data | Function | Transform data | 15 min |
| 2 | Insert Research Paper | Supabase | Save paper | 10 min |
| 3 | Insert CVS Analysis | Supabase | Save analysis | 10 min |
| 4A | Get User Profile | Supabase | Find user | 5 min |
| 4B | Update Analysis with User | Supabase | Link user | 5 min |
| 5 | Log Success | Function | Confirm | 5 min |

**Total:** 50 min + 30-40 min testing = 1.5-2 hours

---

## 📝 Node Connection Order

```
Send Email Report
   ↓
[1] Prepare Supabase Insert Data
   ↓
[2] Insert Research Paper
   ↓
[3] Insert CVS Analysis
   ↓
[4A] Get User Profile
   ↓
[4B] Update Analysis with User
   ↓
[5] Log Success
   ↓
END
```

---

## 🔧 Node 1: Prepare Data (Function)

**Add:** Function node
**Name:** `Prepare Supabase Insert Data`
**Code:** Copy from `N8N_NODE_CODE_SNIPPETS.md` → Node 1

**Key variables it creates:**
- `paper_data` → for Node 2
- `analysis_data` → for Node 3
- `opportunity_id` → R2M-20251216-042
- `user_email` → for Node 4A

**Test:** Click "Execute Node" → Verify output has `paper_data` and `analysis_data`

---

## 📄 Node 2: Insert Paper (Supabase)

**Add:** Supabase node
**Name:** `Insert Research Paper`
**Credential:** R2M Supabase
**Operation:** INSERT
**Table:** `research_papers`
**Data:** `{{ $json.paper_data }}`

**⚠️ CRITICAL:** Check "Return Fields" → Select `id`

**Test:** Execute → Verify returns `{ "id": "uuid..." }`

---

## 📊 Node 3: Insert Analysis (Supabase)

**Add:** Supabase node
**Name:** `Insert CVS Analysis`
**Credential:** R2M Supabase
**Operation:** INSERT
**Table:** `cvs_analyses`
**Data:**
```javascript
{{
  {
    ...JSON.parse('{{ $("Prepare Supabase Insert Data").first().json.analysis_data }}'),
    paper_id: '{{ $("Insert Research Paper").first().json.id }}'
  }
}}
```

**⚠️ CRITICAL:** Check "Return Fields" → Select `id`

**Test:** Execute → Verify returns `{ "id": "uuid..." }`

---

## 👤 Node 4A: Get User (Supabase)

**Add:** Supabase node
**Name:** `Get User Profile`
**Credential:** R2M Supabase
**Operation:** GET
**Table:** `profiles`
**Filter:**
- Column: `email`
- Operator: `=`
- Value: `{{ $("Prepare Supabase Insert Data").first().json.user_email }}`

**Return Fields:** `id`

**Test:** Execute → Verify returns user ID

---

## 👤 Node 4B: Update Analysis (Supabase)

**Add:** Supabase node
**Name:** `Update Analysis with User`
**Credential:** R2M Supabase
**Operation:** UPDATE
**Table:** `cvs_analyses`
**Filter:**
- Column: `id`
- Operator: `=`
- Value: `{{ $("Insert CVS Analysis").first().json.id }}`

**Data:**
```javascript
{{
  {
    "analyzed_by": "{{ $("Get User Profile").first().json.id }}",
    "uploaded_by": "{{ $("Get User Profile").first().json.id }}"
  }
}}
```

**Test:** Execute → Verify update succeeds

---

## ✅ Node 5: Log Success (Function)

**Add:** Function node
**Name:** `Log Success`
**Code:** Copy from `N8N_NODE_CODE_SNIPPETS.md` → Node 5

**Test:** Execute → Check console shows:
```
✅ CVS Analysis saved to Supabase!
Analysis ID: ...
Paper ID: ...
Opportunity ID: R2M-...
CVS Score: 85
```

---

## 🔑 Supabase Credential Setup

**Only do this once (before Node 2):**

1. n8n → Settings → Credentials
2. Click "New Credential"
3. Search "Supabase"
4. Fill in:
   - **Name:** `R2M Supabase`
   - **Host:** `https://vqgwzzzjlswyagncyhih.supabase.co`
   - **Service Role:** Get from Supabase Dashboard → Settings → API → service_role key
5. Click "Save"

**⚠️ Use service_role (NOT anon key!)**

---

## 🧪 Testing Commands

### After n8n implementation:

**In Supabase SQL Editor:**
```sql
-- Check paper inserted
SELECT * FROM research_papers
ORDER BY created_at DESC
LIMIT 1;

-- Check analysis inserted
SELECT * FROM cvs_analyses
ORDER BY created_at DESC
LIMIT 1;

-- Verify linkage
SELECT
  p.title,
  c.cvs_score,
  c.paper_id = p.id AS "linked_correctly"
FROM cvs_analyses c
JOIN research_papers p ON c.paper_id = p.id
ORDER BY c.created_at DESC
LIMIT 1;
```

**Expected output:**
- 1 research_papers row
- 1 cvs_analyses row
- `linked_correctly` = `true`

---

## ⚠️ Common Errors Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot read property 'json' of undefined" | Previous node failed | Check "Return Fields" checked |
| "Foreign key violation" | paper_id doesn't exist | Verify Insert Paper succeeded |
| "Authentication failed" | Wrong key | Use service_role key |
| "Column does not exist" | Migration missing | Run migration 009 & 010 |
| "Null value in NOT NULL column" | Missing required field | Check cvs_score exists |
| "Invalid JSON" | Syntax error | Use Expression Editor (fx icon) |

---

## 📊 Data Verification Checklist

After successful workflow execution:

**In n8n:**
- [ ] All 5 nodes green ✅
- [ ] "Log Success" shows all IDs
- [ ] No red error nodes ❌

**In Supabase:**
- [ ] `research_papers` has new row
- [ ] `cvs_analyses` has new row
- [ ] `cvs_score` is 0-100 (not null)
- [ ] `paper_id` matches between tables
- [ ] `analyzed_by` is not null

**Data quality:**
- [ ] Title makes sense
- [ ] TAM is reasonable number
- [ ] TRL is 1-9
- [ ] Summary is not empty
- [ ] Recommendations exist

---

## 🎯 Success Criteria

```
✅ n8n workflow executes without errors
✅ Supabase shows 1 new research_papers row
✅ Supabase shows 1 new cvs_analyses row
✅ paper_id links correctly
✅ analyzed_by links to user
✅ CVS score is populated (0-100)
✅ Ready to connect marketplace UI
```

---

## 🚨 If Stuck

**Check in this order:**

1. **Error message** in red node
   - Read carefully
   - Check which field is mentioned

2. **Previous node output**
   - Click previous node
   - Check "Output" tab
   - Verify data structure

3. **Expressions**
   - Use Expression Editor (fx icon)
   - Test with "Test Step" button
   - Check node names match exactly

4. **Supabase credential**
   - Verify selected in all Supabase nodes
   - Check service_role key is correct

5. **Database**
   - Run verification query in Supabase
   - Check migrations ran successfully

---

## 💡 Pro Tips

1. **Test incrementally:** Execute each node individually before running full workflow
2. **Save frequently:** n8n auto-saves, but click Save after major changes
3. **Use descriptive names:** Exact node names matter for expressions
4. **Check Return Fields:** Critical for Nodes 2 & 3
5. **Console.log:** Add logging in Function nodes for debugging
6. **Incognito mode:** Test workflow in private browser to avoid cache issues

---

## 🔗 Related Documentation

- **Detailed guide:** `N8N_INTEGRATION_CHECKLIST.md`
- **Code snippets:** `N8N_NODE_CODE_SNIPPETS.md`
- **Visual diagrams:** `N8N_WORKFLOW_DIAGRAM.md`
- **Data mapping:** `N8N_SUPABASE_INTEGRATION_GUIDE.md`

---

## ⏱️ Estimated Time Breakdown

| Task | Time | Cumulative |
|------|------|------------|
| Read documentation | 10 min | 10 min |
| Add Supabase credential | 5 min | 15 min |
| Node 1 (Prepare Data) | 15 min | 30 min |
| Node 2 (Insert Paper) | 10 min | 40 min |
| Node 3 (Insert Analysis) | 10 min | 50 min |
| Node 4A (Get User) | 5 min | 55 min |
| Node 4B (Update User) | 5 min | 60 min |
| Node 5 (Log Success) | 5 min | 65 min |
| Testing & debugging | 30 min | 95 min |

**Total: ~1.5 hours**

---

## 📱 Quick Test Input

Use this test query in n8n workflow:

```json
{
  "query": "AI for drug discovery",
  "domain": "Healthcare",
  "user_email": "YOUR_EMAIL+investor_ai@gmail.com"
}
```

Replace `YOUR_EMAIL` with your Gmail username.

---

**Last Updated:** December 16, 2025
**Status:** Ready to implement! 🚀
**Estimated Time:** 1.5-2 hours
**Difficulty:** Intermediate
**Reward:** Real CVS data in marketplace! 🎉
