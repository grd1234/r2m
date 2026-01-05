# R2M Marketplace

**Transform Research into Market Opportunities**

A platform connecting breakthrough research with investors and partners through AI-powered Commercial Viability Score (CVS) analysis.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev
```

Visit **http://localhost:3000**

## 📚 Documentation

All documentation has been organized into the `docs/` folder:

### Setup & Getting Started
- **[docs/setup/SETUP.md](./docs/setup/SETUP.md)** - Complete setup guide
- **[docs/setup/QUICK_START_DATABASE.md](./docs/setup/QUICK_START_DATABASE.md)** - Database setup (10 min)
- **[docs/setup/BUILD_SUMMARY.md](./docs/setup/BUILD_SUMMARY.md)** - What's been built
- **[docs/setup/SUPABASE_EMAIL_SETUP.md](./docs/setup/SUPABASE_EMAIL_SETUP.md)** - Email configuration

### Implementation Guides
- **[docs/guides/STRIPE_INTEGRATION_GUIDE.md](./docs/guides/STRIPE_INTEGRATION_GUIDE.md)** - Stripe payment setup
- **[docs/guides/STRIPE_SETUP_QUICKSTART.md](./docs/guides/STRIPE_SETUP_QUICKSTART.md)** - Quick Stripe guide
- **[docs/guides/PAY_WITH_STRIPE_SETUP.md](./docs/guides/PAY_WITH_STRIPE_SETUP.md)** - Payment flow setup
- **[docs/guides/PERSONA_WORKFLOWS.md](./docs/guides/PERSONA_WORKFLOWS.md)** - User workflows by persona

### Architecture & Planning
- **[docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md](./docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md)** - 8-phase implementation roadmap
- **[docs/planning/PROJECT_STATUS.md](./docs/planning/PROJECT_STATUS.md)** - Current status
- **[docs/architecture/LANGGRAPH_ARCHITECTURE.md](./docs/architecture/LANGGRAPH_ARCHITECTURE.md)** - LangGraph CVS scoring design
- **[docs/architecture/COMMITMENT_SYSTEM_SUMMARY.md](./docs/architecture/COMMITMENT_SYSTEM_SUMMARY.md)** - Investment system
- **[docs/architecture/INVESTMENT_COMMITMENT_RATIONALE.md](./docs/architecture/INVESTMENT_COMMITMENT_RATIONALE.md)** - Investment logic

### Testing
- **[docs/testing/TESTING_GUIDE.md](./docs/testing/TESTING_GUIDE.md)** - Complete testing guide
- **[docs/testing/QUICK_TEST_STEPS.md](./docs/testing/QUICK_TEST_STEPS.md)** - Quick test checklist
- **[docs/testing/EMAIL_CONFIRMATION_TEST.md](./docs/testing/EMAIL_CONFIRMATION_TEST.md)** - Email testing
- **[docs/testing/EMAIL_CONFIRMATION_STATUS.md](./docs/testing/EMAIL_CONFIRMATION_STATUS.md)** - Email status
- **[docs/testing/QUICK_EMAIL_TEST.md](./docs/testing/QUICK_EMAIL_TEST.md)** - Quick email test

## ✅ Current Status

**Phase 1 Complete** - Frontend & Database Ready

### What's Working
- ✅ Landing page with persona-specific flows
- ✅ Three-persona system (Innovator, Investor, Researcher)
- ✅ User authentication (signup/login for all personas)
- ✅ Pricing page (6 tiers: Free → Enterprise)
- ✅ Professional dark theme UI
- ✅ Navigation with persona-specific menus
- ✅ Database schema designed (7 tables)
- ✅ Row Level Security policies ready
- ✅ LangGraph architecture planned

### Next Steps (Week 1)
- 🔜 Execute database setup in Supabase
- 🔜 Build research paper upload API
- 🔜 Implement CVS scoring engine (LangGraph)
- 🔜 Create marketplace listing

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **AI/ML**: LangGraph, LangChain, Claude 3.5 Sonnet (planned)
- **Payments**: Stripe (planned)
- **State**: Zustand
- **Deployment**: Vercel (ready)

## 📁 Project Structure

```
r2m-marketplace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   │   ├── login/         # Login for 3 personas
│   │   │   └── signup/        # Signup for 3 personas
│   │   ├── about/             # About page
│   │   ├── dashboard/         # Dashboard (protected)
│   │   ├── how-it-works/      # How It Works page
│   │   ├── pricing/           # Pricing page (6 tiers)
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── landing/           # Landing page components
│   │   ├── shared/            # Shared components (Navigation, Footer)
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   └── supabase/          # Supabase clients (client/server)
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript types (database types)
├── docs/                      # 📚 All Documentation
│   ├── setup/                 # Setup guides
│   ├── guides/                # Implementation guides
│   ├── architecture/          # Architecture docs
│   ├── planning/              # Planning & roadmaps
│   └── testing/               # Testing guides
├── supabase/                  # Supabase configuration
│   ├── migrations/            # SQL migration scripts
│   │   ├── 001_create_tables.sql
│   │   └── 002_enable_rls.sql
│   └── SETUP_INSTRUCTIONS.md  # Step-by-step DB setup
├── public/                    # Static assets (images, videos)
└── scripts/                   # Utility scripts (empty, for future)
```

## 🎨 Design System

**Personas & Colors:**
- Innovator: Blue-Indigo gradient
- Investor: Cyan-Teal gradient
- Researcher: Emerald-Teal gradient

**Theme:**
- Dark gradient background (from-slate-900 via-blue-900 to-slate-800)
- Dark cards with blue borders (border-blue-400/30)
- White headings, gray-200/300 body text

**Spacing:** 8px grid (4px, 8px, 16px, 24px, 32px, 48px, 64px)

**Typography:** System fonts, responsive sizing

## 🗄️ Database Schema

7 tables with Row Level Security:

1. **profiles** - User accounts (extends Supabase auth)
2. **research_papers** - Research data & PDFs
3. **cvs_scores** - Commercial Viability Scores (6 dimensions)
4. **subscriptions** - Stripe billing data
5. **deals** - Investment opportunities tracking
6. **watchlist** - Saved research papers
7. **notifications** - User alerts

See `supabase/migrations/` for complete schema.

## 💰 Pricing Tiers

| Tier | Price | Target | CVS Reports |
|------|-------|--------|-------------|
| Free | $0 | Everyone | 3/month |
| Innovator Basic | $100/year | Startups | 20/month |
| Innovator Premium | $300/year | Growing startups | 50/month |
| Innovator Pro | $500/year | Scale-ups | Unlimited |
| Growth | $5,000/year | Scaling companies | Unlimited + Team |
| Enterprise | Custom | VCs, Corporates | Custom features |

## 🔐 Security

- Row Level Security (RLS) on all tables
- JWT authentication via Supabase
- Users can only access their own data
- Auto-profile creation on signup
- Storage policies for PDF uploads
- Environment variables for secrets

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Run dev server
npm run dev
```

See `docs/testing/TESTING_GUIDE.md` for complete testing instructions.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

Ready to deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 Getting Started Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add Supabase credentials to `.env.local`
- [ ] Follow `docs/setup/QUICK_START_DATABASE.md` (10 min)
- [ ] Run `npm run dev`
- [ ] Test signup/login flows
- [ ] Review `docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md`

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

## 📞 Support

**Need Help?**
- Check `docs/setup/SETUP.md` for detailed setup
- Review `docs/planning/IMPLEMENTATION_PLAN_2024-12-11.md` for roadmap
- See `docs/testing/TESTING_GUIDE.md` for testing

## 📄 License

MIT

---

**Last Updated:** December 11, 2024
**Current Phase:** Database Setup → Research Upload → CVS Scoring
