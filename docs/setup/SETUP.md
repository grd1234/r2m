# R2M Marketplace - Setup Guide

This guide will help you set up and run the R2M Marketplace application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier available)

## Step 1: Install Dependencies

All dependencies have been installed. If you need to reinstall:

```bash
cd /Users/geetadesaraju/bootcamp2510/your_workspace/sprint4/r2m-marketplace
npm install
```

## Step 2: Set Up Supabase Database

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Create a new organization (if needed)
4. Create a new project:
   - Choose a project name (e.g., "r2m-marketplace")
   - Set a database password (save this!)
   - Select a region closest to you
   - Wait for project to be created (~2 minutes)

### Run Database Schema

1. In your Supabase project dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `/supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the schema
6. Verify tables were created by checking the "Table Editor" section

### Get Your Credentials

1. In Supabase dashboard, go to "Project Settings" > "API"
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
```

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Step 5: Test the Application

### Test Landing Page
1. Visit http://localhost:3000
2. You should see:
   - Navigation bar with R2M logo
   - Hero section with "Transform Research into Market Opportunities"
   - "How It Works" section with 3 steps

### Test Authentication
1. Click "Get Started" or navigate to http://localhost:3000/signup
2. Create a test account:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
   - User Type: Startup / Researcher
   - Company: Test Company
3. Click "Create Account"
4. You should be redirected to login page
5. Login with the credentials you just created
6. You should see the Dashboard

### Test Dashboard
After logging in, you should see:
- Welcome message with your name
- Two quick action cards:
  - "New Analysis"
  - "Browse Marketplace"
- Four stat cards (all showing 0 for now)
- "Recent Activity" section (empty state)

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Restart the dev server after changing environment variables

### "Table does not exist" error
- Make sure you ran the schema.sql in Supabase SQL Editor
- Check the "Table Editor" in Supabase to verify tables exist

### "Cannot find module" errors
- Run `npm install` to install dependencies
- Make sure you're in the correct directory

### Authentication not working
- Check that the `handle_new_user()` function was created in the schema
- Verify in Supabase > Authentication that users are being created
- Check browser console for specific error messages

## Project Structure

```
r2m-marketplace/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # Login page
│   │   │   └── signup/page.tsx        # Signup page
│   │   ├── dashboard/page.tsx         # Main dashboard
│   │   └── page.tsx                   # Landing page
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx               # Hero section
│   │   │   └── HowItWorks.tsx         # How it works section
│   │   ├── shared/
│   │   │   └── Navigation.tsx         # Navigation bar
│   │   └── ui/                        # shadcn/ui components
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts              # Client-side Supabase
│   │       └── server.ts              # Server-side Supabase
│   ├── store/
│   │   └── useUserStore.ts            # Zustand state management
│   └── types/
│       └── database.types.ts          # TypeScript types
├── supabase/
│   └── schema.sql                     # Database schema
├── .env.local.example                 # Example environment variables
└── .env.local                         # Your environment variables (create this)
```

## What's Built

### ✅ Completed Features

1. **Project Setup**
   - Next.js 14 with App Router
   - TypeScript configuration
   - Tailwind CSS with R2M design tokens
   - shadcn/ui component library

2. **Database**
   - Complete schema with 10 tables
   - Row Level Security (RLS) policies
   - Automatic profile creation on signup
   - User types: startup, investor, corporate_rd, tto, innovation_hub

3. **Authentication**
   - Login page with email/password
   - Signup page with user type selection
   - Session management with Supabase Auth
   - Protected routes

4. **Landing Page**
   - Hero section with CTA
   - "How It Works" section (3 steps)
   - Responsive navigation
   - Trust indicators

5. **Dashboard**
   - Welcome message
   - Quick action cards
   - Stats overview (analyses, listings, CVS score, connections)
   - Recent activity section

### 🚧 To Be Built (Next Steps)

1. **Request Analysis Workflow**
   - Search interface
   - Paper selection
   - Analysis processing
   - Results display with CVS score

2. **Marketplace**
   - Browse listings (grid/list view)
   - Filters (category, stage, funding)
   - Opportunity detail page
   - Save opportunities

3. **Create Listing**
   - Convert analysis to listing
   - Add description and details
   - Publish to marketplace

4. **Investor Matching**
   - View matched investors
   - Request introductions
   - Track connection status

5. **Corporate R&D Features**
   - Batch upload CSV
   - Bulk analysis processing
   - Results table
   - Export results

## Next Development Steps

1. **Implement Request Analysis Workflow**
   ```bash
   # Create analysis pages
   src/app/analysis/
   ├── search/page.tsx
   ├── results/[id]/page.tsx
   └── components/
   ```

2. **Add API Routes**
   ```bash
   # Create API endpoints
   src/app/api/
   ├── analyses/route.ts
   ├── listings/route.ts
   └── introductions/route.ts
   ```

3. **Implement Marketplace**
   ```bash
   # Create marketplace pages
   src/app/marketplace/
   ├── page.tsx
   ├── [id]/page.tsx
   └── components/
   ```

## Design System Reference

All design tokens from wireframes are configured in `src/app/globals.css`:

- **Colors**: `var(--r2m-primary)`, `var(--r2m-success)`, etc.
- **Spacing**: 8px base grid (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- **Typography**: Inter font, sizes from 10px to 48px
- **Border Radius**: 4px, 8px, 12px, 16px

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

## Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal where dev server is running
3. Review Supabase logs in dashboard
4. Verify environment variables are correct
5. Restart the dev server

---

**Happy Building!** 🚀
