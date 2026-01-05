# R2M Marketplace - Project Organization
**Date:** December 11, 2024

---

## 📂 Folder Structure

The project has been reorganized for better maintainability and clarity.

### Root Directory (Clean)

```
r2m-marketplace/
├── .env.local              # Environment variables (gitignored)
├── .env.local.example      # Example environment file
├── .gitignore              # Git ignore rules
├── README.md               # Main project documentation
├── package.json            # Dependencies
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui configuration
├── postcss.config.mjs      # PostCSS configuration
├── eslint.config.mjs       # ESLint configuration
│
├── src/                    # Source code
├── public/                 # Static assets
├── docs/                   # 📚 All documentation (NEW!)
├── supabase/               # Database configuration
├── scripts/                # Utility scripts
└── node_modules/           # Dependencies (gitignored)
```

---

## 📚 Documentation Organization (`docs/`)

All documentation has been moved from the root directory into organized subfolders:

### 1. Setup Documentation (`docs/setup/`)

Initial setup and getting started guides:

- **SETUP.md** - Complete setup guide with Supabase configuration
- **QUICK_START_DATABASE.md** - 10-minute database setup guide
- **BUILD_SUMMARY.md** - What's been built and what's next
- **SUPABASE_EMAIL_SETUP.md** - Email confirmation configuration

**Use case:** First-time setup, onboarding new developers

---

### 2. Implementation Guides (`docs/guides/`)

Step-by-step implementation instructions:

- **STRIPE_INTEGRATION_GUIDE.md** - Complete Stripe setup (detailed)
- **STRIPE_SETUP_QUICKSTART.md** - Quick Stripe integration
- **PAY_WITH_STRIPE_SETUP.md** - Payment flow implementation
- **PERSONA_WORKFLOWS.md** - User workflows for each persona

**Use case:** Building specific features (payments, user flows)

---

### 3. Architecture & Planning (`docs/architecture/` & `docs/planning/`)

High-level design and planning documents:

**Planning:**
- **IMPLEMENTATION_PLAN_2024-12-11.md** - 8-phase roadmap (Week 1-8+)
- **PROJECT_STATUS.md** - Current project status

**Architecture:**
- **LANGGRAPH_ARCHITECTURE.md** - LangGraph CVS scoring design
- **COMMITMENT_SYSTEM_SUMMARY.md** - Investment commitment system
- **INVESTMENT_COMMITMENT_RATIONALE.md** - Investment logic

**Use case:** Understanding the big picture, planning sprints

---

### 4. Testing Documentation (`docs/testing/`)

Testing guides and test results:

- **TESTING_GUIDE.md** - Complete testing guide
- **QUICK_TEST_STEPS.md** - Quick test checklist
- **EMAIL_CONFIRMATION_TEST.md** - Email testing procedures
- **EMAIL_CONFIRMATION_STATUS.md** - Email testing status
- **QUICK_EMAIL_TEST.md** - Quick email verification

**Use case:** Running tests, verifying functionality

---

## 🗂️ Source Code Organization (`src/`)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/         # Login pages (3 personas)
│   │   │   ├── innovator/
│   │   │   ├── investor/
│   │   │   └── researcher/
│   │   └── signup/        # Signup pages (3 personas)
│   │       ├── innovator/
│   │       ├── investor/
│   │       └── researcher/
│   ├── about/             # About page
│   ├── dashboard/         # Dashboard (protected)
│   ├── how-it-works/      # How It Works page
│   ├── pricing/           # Pricing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/
│   ├── landing/           # Landing page components
│   │   ├── Hero.tsx
│   │   ├── CVSExplainer.tsx
│   │   ├── PersonaRoles.tsx
│   │   └── MarketplaceBridge.tsx
│   ├── shared/            # Shared components
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   └── ui/                # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
│
├── lib/
│   └── supabase/          # Supabase clients
│       ├── client.ts      # Browser client
│       └── server.ts      # Server client
│
├── store/                 # Zustand state management
│   └── useUserStore.ts    # User state
│
└── types/                 # TypeScript types
    └── database.types.ts  # Supabase generated types
```

---

## 🗄️ Database Organization (`supabase/`)

```
supabase/
├── migrations/
│   ├── 001_create_tables.sql     # Create 7 core tables
│   └── 002_enable_rls.sql        # Row Level Security policies
└── SETUP_INSTRUCTIONS.md         # Step-by-step setup guide
```

**Tables:**
1. profiles
2. research_papers
3. cvs_scores
4. subscriptions
5. deals
6. watchlist
7. notifications

---

## 🎯 Quick Navigation

### I want to...

**Set up the project for the first time:**
→ Read: `docs/setup/SETUP.md`
→ Then: `docs/setup/QUICK_START_DATABASE.md`

**Understand the implementation plan:**
→ Read: `docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md`

**Learn about CVS scoring:**
→ Read: `docs/architecture/LANGGRAPH_ARCHITECTURE.md`

**Set up Stripe payments:**
→ Read: `docs/guides/STRIPE_SETUP_QUICKSTART.md`

**Test the application:**
→ Read: `docs/testing/QUICK_TEST_STEPS.md`

**Understand user workflows:**
→ Read: `docs/guides/PERSONA_WORKFLOWS.md`

**Check current status:**
→ Read: `docs/planning/PROJECT_STATUS.md`

---

## 🧹 What Was Cleaned Up

### Before (Root Directory Clutter)
- 18 markdown files in root directory
- No clear organization
- Hard to find relevant documentation
- Cluttered view when opening project

### After (Organized Structure)
- 1 main README.md in root
- All docs organized into `docs/` with 5 subfolders
- Clear navigation by topic
- Professional project structure

---

## 📋 Benefits of New Organization

1. **Easier Navigation** - Documents grouped by purpose
2. **Professional Structure** - Follows industry best practices
3. **Better Onboarding** - New developers know where to start
4. **Maintainability** - Easy to update and add new docs
5. **Clean Root** - Less clutter, easier to find config files
6. **Scalability** - Room to grow without getting messy

---

## 🔄 Migration Notes

All files were moved, not copied. Original paths no longer exist.

**If you have links to old paths, update them:**

| Old Path | New Path |
|----------|----------|
| `./SETUP.md` | `./docs/setup/SETUP.md` |
| `./IMPLEMENTATION_PLAN_2024-12-11.md` | `./docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md` |
| `./LANGGRAPH_ARCHITECTURE.md` | `./docs/architecture/LANGGRAPH_ARCHITECTURE.md` |
| `./TESTING_GUIDE.md` | `./docs/testing/TESTING_GUIDE.md` |
| ... | (see above sections for all mappings) |

---

## 🚀 Next Steps

1. ✅ Project organization complete
2. 🔜 Execute database setup (`docs/setup/QUICK_START_DATABASE.md`)
3. 🔜 Begin Phase 2 implementation (Research Upload)
4. 🔜 Build CVS scoring engine

---

**Last Updated:** December 11, 2024
**Organized By:** Claude Code Assistant
