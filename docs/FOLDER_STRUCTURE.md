# R2M Marketplace - Complete Folder Structure

## Project Root

```
r2m-marketplace/
├── .env.local                   # Environment variables (gitignored)
├── .env.local.example           # Example environment file
├── .gitignore                   # Git ignore rules
├── .next/                       # Next.js build output (gitignored)
├── components.json              # shadcn/ui configuration
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── next-env.d.ts                # Next.js TypeScript declarations
├── node_modules/                # Dependencies (gitignored)
├── package.json                 # Project dependencies & scripts
├── package-lock.json            # Dependency lock file
├── postcss.config.mjs           # PostCSS configuration
├── README.md                    # Main project documentation
├── tsconfig.json                # TypeScript configuration
├── ORGANIZATION_COMPLETE.md     # Organization completion summary
│
├── docs/                        # 📚 All Documentation
│   ├── setup/                   # Setup & Getting Started
│   │   ├── SETUP.md
│   │   ├── QUICK_START_DATABASE.md
│   │   ├── BUILD_SUMMARY.md
│   │   └── SUPABASE_EMAIL_SETUP.md
│   │
│   ├── guides/                  # Implementation Guides
│   │   ├── STRIPE_INTEGRATION_GUIDE.md
│   │   ├── STRIPE_SETUP_QUICKSTART.md
│   │   ├── PAY_WITH_STRIPE_SETUP.md
│   │   └── PERSONA_WORKFLOWS.md
│   │
│   ├── architecture/            # Architecture & Design
│   │   ├── LANGGRAPH_ARCHITECTURE.md
│   │   ├── COMMITMENT_SYSTEM_SUMMARY.md
│   │   └── INVESTMENT_COMMITMENT_RATIONALE.md
│   │
│   ├── planning/                # Planning & Roadmaps
│   │   ├── IMPLEMENTATION_PLAN_2024-12-11.md
│   │   └── PROJECT_STATUS.md
│   │
│   ├── testing/                 # Testing Documentation
│   │   ├── TESTING_GUIDE.md
│   │   ├── QUICK_TEST_STEPS.md
│   │   ├── EMAIL_CONFIRMATION_TEST.md
│   │   ├── EMAIL_CONFIRMATION_STATUS.md
│   │   └── QUICK_EMAIL_TEST.md
│   │
│   ├── PROJECT_ORGANIZATION.md  # Organization guide
│   └── FOLDER_STRUCTURE.md      # This file
│
├── src/                         # Source Code
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   │   ├── innovator/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── investor/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── researcher/
│   │   │   │       └── page.tsx
│   │   │   └── signup/
│   │   │       ├── innovator/
│   │   │       │   └── page.tsx
│   │   │       ├── investor/
│   │   │       │   └── page.tsx
│   │   │       └── researcher/
│   │   │           └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── how-it-works/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── page.tsx             # Landing page
│   │
│   ├── components/              # React Components
│   │   ├── landing/            # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── CVSExplainer.tsx
│   │   │   ├── PersonaRoles.tsx
│   │   │   └── MarketplaceBridge.tsx
│   │   ├── shared/             # Shared components
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── ...
│   │
│   ├── lib/                     # Libraries & Utilities
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Supabase client
│   │   │   └── server.ts       # Server Supabase client
│   │   └── utils.ts            # Utility functions
│   │
│   ├── store/                   # Zustand State Management
│   │   └── useUserStore.ts     # User state store
│   │
│   └── types/                   # TypeScript Types
│       └── database.types.ts   # Supabase generated types
│
├── supabase/                    # Database Configuration
│   ├── migrations/
│   │   ├── 001_create_tables.sql
│   │   └── 002_enable_rls.sql
│   └── SETUP_INSTRUCTIONS.md
│
├── public/                      # Static Assets
│   ├── images/
│   ├── videos/
│   └── ...
│
└── scripts/                     # Utility Scripts
    └── (empty - for future use)
```

## File Count by Category

| Category | Count | Purpose |
|----------|-------|---------|
| **Configuration** | 8 files | Project config (package.json, tsconfig, etc.) |
| **Documentation** | 20 files | All docs in `docs/` folder |
| **Source Code** | ~30 files | React components, pages, utilities |
| **Database** | 3 files | SQL migrations & setup guide |
| **Total Project** | ~60 files | (excluding node_modules) |

## Key Directories Explained

### `/src/app/` - Next.js Pages
Uses App Router with file-based routing:
- `(auth)/` - Route group (doesn't affect URL)
- `page.tsx` - Creates route
- `layout.tsx` - Shared layout

### `/src/components/` - React Components
- `landing/` - Landing page specific
- `shared/` - Reusable across pages
- `ui/` - shadcn/ui library components

### `/docs/` - Documentation Hub
All documentation organized by category:
- `setup/` - First-time setup
- `guides/` - Implementation steps
- `architecture/` - System design
- `planning/` - Roadmaps
- `testing/` - Test procedures

### `/supabase/` - Database
- `migrations/` - SQL scripts (version controlled)
- `SETUP_INSTRUCTIONS.md` - Step-by-step guide

## Quick Find

| Looking for... | Location |
|---------------|----------|
| Project overview | `README.md` |
| Setup instructions | `docs/setup/SETUP.md` |
| Database setup | `docs/setup/QUICK_START_DATABASE.md` |
| Implementation plan | `docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md` |
| Landing page code | `src/app/page.tsx` |
| Hero component | `src/components/landing/Hero.tsx` |
| Login pages | `src/app/(auth)/login/` |
| Signup pages | `src/app/(auth)/signup/` |
| Database types | `src/types/database.types.ts` |
| SQL migrations | `supabase/migrations/` |

---

**Last Updated:** December 11, 2024
**Structure Version:** 1.0
