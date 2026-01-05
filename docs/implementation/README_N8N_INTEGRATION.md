# n8n → Supabase Integration Documentation

**Quick Start Guide for Adding 5 Nodes to n8n Orchestrator**

---

## 🎯 What This Is

This folder contains **7 comprehensive guides** for implementing the n8n → Supabase integration that automatically saves CVS analysis results to your database.

**Goal:** Connect your n8n CVS analysis workflow to Supabase so the marketplace can display real opportunities instead of mock data.

**Time:** 1.5-2 hours to implement

---

## 📚 Documents in This Folder

| Document | Purpose | When to Use | Time |
|----------|---------|-------------|------|
| **N8N_INTEGRATION_INDEX.md** | Navigation guide | Start here to find the right doc | 2 min |
| **N8N_IMPLEMENTATION_SUMMARY.md** | Architecture overview | Understand what we're building | 10 min |
| **N8N_INTEGRATION_CHECKLIST.md** | Step-by-step guide | Follow this to implement | 1.5-2 hours |
| **N8N_NODE_CODE_SNIPPETS.md** | Copy/paste code | Use while building nodes | 5 min/node |
| **N8N_QUICK_REFERENCE.md** | Quick lookup card | Print for desk reference | As needed |
| **N8N_WORKFLOW_DIAGRAM.md** | Visual diagrams | Understand data flow | 10 min |
| **N8N_SUPABASE_INTEGRATION_GUIDE.md** | Data mapping details | Customize field mappings | As needed |
| **N8N_NODES_VISUAL_GUIDE.md** | Node-by-node visuals | Visual reference | As needed |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Read the Overview (10 min)
```
📖 Open: N8N_IMPLEMENTATION_SUMMARY.md
```
- Understand architecture
- Review success criteria
- Check prerequisites

### Step 2: Follow the Checklist (1.5 hours)
```
📝 Open: N8N_INTEGRATION_CHECKLIST.md
📋 Print: N8N_QUICK_REFERENCE.md
```
- Follow 7 detailed steps
- Copy code from N8N_NODE_CODE_SNIPPETS.md
- Test each node as you go

### Step 3: Verify Success (15 min)
```
✅ Check n8n: All nodes green
✅ Check Supabase: 2 new rows (research_papers + cvs_analyses)
✅ Test marketplace: Ready for real data
```

---

## 📊 What Gets Built

### 5 New n8n Nodes:

```
[Send Email Report]
    ↓
[1] Prepare Supabase Insert Data (Function)
    ↓
[2] Insert Research Paper (Supabase)
    ↓
[3] Insert CVS Analysis (Supabase)
    ↓
[4] Get User Profile + Update (Supabase)
    ↓
[5] Log Success (Function)
```

### Database Impact:

**research_papers** table:
- 1 new row per analysis
- Fields: title, authors, abstract, stage, TRL

**cvs_analyses** table:
- 1 new row per analysis
- Fields: cvs_score, TAM, technical/market/competitive scores
- Linked to research_papers and profiles

---

## ✅ Prerequisites

Before starting:
- [ ] n8n workflow accessible (`00 - Orchestrator Agent_emailFixed`)
- [ ] Supabase credentials ready
- [ ] Migrations 009 & 010 run
- [ ] Test user exists in profiles table
- [ ] 1.5-2 hours available

---

## 🎯 Success Criteria

After implementation:
- ✅ All 5 nodes execute without errors
- ✅ Database shows 2 new rows (research_papers + cvs_analyses)
- ✅ Foreign keys link correctly
- ✅ CVS scores populated (0-100)
- ✅ Ready to connect marketplace UI

---

## 📖 Reading Order

### First-Time Implementation:
1. N8N_IMPLEMENTATION_SUMMARY.md (10 min)
2. N8N_INTEGRATION_CHECKLIST.md (follow step-by-step)
3. N8N_NODE_CODE_SNIPPETS.md (copy code as you go)
4. N8N_QUICK_REFERENCE.md (keep open for quick lookups)

### Troubleshooting:
1. N8N_QUICK_REFERENCE.md → Common Errors section
2. N8N_WORKFLOW_DIAGRAM.md → Troubleshooting flow
3. N8N_SUPABASE_INTEGRATION_GUIDE.md → Field mappings

### Customization:
1. N8N_SUPABASE_INTEGRATION_GUIDE.md → Understand data mappings
2. N8N_NODE_CODE_SNIPPETS.md → Modify code as needed

---

## 🔑 Key Concepts

### Opportunity ID
```javascript
R2M-20251216-042
// Format: R2M-YYYYMMDD-XXX
```

### TRL to Stage Mapping
```
TRL 1-3  → Concept
TRL 4-6  → Prototype
TRL 7-8  → Pilot
TRL 9    → Market-Ready
```

### Node Expression References
```javascript
$('Node Name').first().json.field_name
```

---

## 🚨 Common Errors

| Error | Solution Document |
|-------|-------------------|
| "Cannot read property 'json'..." | N8N_QUICK_REFERENCE.md |
| Foreign key violation | N8N_QUICK_REFERENCE.md |
| Wrong data being inserted | N8N_SUPABASE_INTEGRATION_GUIDE.md |
| Workflow timeout | N8N_INTEGRATION_CHECKLIST.md |

---

## 📊 Visual Overview

```
┌─────────────────────────────────────────────┐
│     EXISTING N8N WORKFLOW (9 nodes)         │
│  Discovery → Agents → CVS → Email           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│     NEW SUPABASE INTEGRATION (5 nodes)      │
│  Prepare → Insert Paper → Insert Analysis   │
│  → Get User → Update → Log Success          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         SUPABASE DATABASE                   │
│  research_papers ← cvs_analyses → profiles  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│       R2M MARKETPLACE UI                    │
│  Real opportunities (not mock data!)        │
└─────────────────────────────────────────────┘
```

---

## 🎓 Learning Resources

### Internal:
- All guides in this folder
- Comments in code snippets
- Inline explanations in checklist

### External:
- n8n Docs: https://docs.n8n.io
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs

---

## 🔄 Next Steps After Implementation

1. **Verify database:** Check Supabase tables populated
2. **Update marketplace:** Replace mock data with real Supabase query
3. **Test user flow:** Login → Browse → View opportunity
4. **Add matching:** Connect investor preferences to opportunities

---

## 📞 Quick Help

### "Where do I start?"
→ Read: **N8N_INTEGRATION_INDEX.md**

### "I'm ready to implement"
→ Follow: **N8N_INTEGRATION_CHECKLIST.md**

### "I need code to copy"
→ Use: **N8N_NODE_CODE_SNIPPETS.md**

### "I'm stuck on an error"
→ Check: **N8N_QUICK_REFERENCE.md** → Common Errors

### "I want to customize data"
→ Reference: **N8N_SUPABASE_INTEGRATION_GUIDE.md**

---

## 💡 Pro Tips

1. **Test incrementally:** Add one node, test, then proceed
2. **Print the quick reference:** Keep N8N_QUICK_REFERENCE.md at your desk
3. **Check Return Fields:** Critical for Supabase INSERT nodes
4. **Use Expression Editor:** Click fx icon in n8n for autocomplete
5. **Save frequently:** n8n auto-saves but click Save after big changes

---

## ✨ What This Unlocks

**Before:**
- ❌ n8n results only via email
- ❌ Marketplace shows mock data
- ❌ No opportunity tracking

**After:**
- ✅ Auto-save to database
- ✅ Real marketplace data
- ✅ Foundation for matching
- ✅ Introduction request tracking
- ✅ Deal pipeline functionality

---

## 📊 Implementation Checklist

Quick checklist for implementation:

```
□ Read N8N_IMPLEMENTATION_SUMMARY.md
□ Verify prerequisites (n8n access, Supabase creds, test user)
□ Print N8N_QUICK_REFERENCE.md
□ Open N8N_INTEGRATION_CHECKLIST.md
□ Open N8N_NODE_CODE_SNIPPETS.md
□ Add Supabase credential to n8n
□ Add Node 1: Prepare Data (Function)
□ Add Node 2: Insert Paper (Supabase)
□ Add Node 3: Insert Analysis (Supabase)
□ Add Node 4A: Get User (Supabase)
□ Add Node 4B: Update Analysis (Supabase)
□ Add Node 5: Log Success (Function)
□ Test full workflow
□ Verify database entries
□ Ready for marketplace integration!
```

---

**Last Updated:** December 16, 2025
**Status:** Documentation complete, ready for implementation
**Estimated Time:** 1.5-2 hours
**Difficulty:** Intermediate

---

## 🚀 Ready to Start?

1. **Read:** N8N_IMPLEMENTATION_SUMMARY.md (10 min)
2. **Print:** N8N_QUICK_REFERENCE.md
3. **Follow:** N8N_INTEGRATION_CHECKLIST.md (1.5 hours)
4. **Win:** Real CVS data in your marketplace! 🎉

Good luck!
