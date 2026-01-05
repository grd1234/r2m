# Generate TypeScript Types from Supabase

This guide explains how to generate TypeScript types from your Supabase database schema.

## Why Generate Types?

- ✅ **Autocomplete** in your editor for database columns
- ✅ **Type safety** to catch errors before runtime
- ✅ **IntelliSense** to see available fields
- ✅ **Faster development** with autocomplete

See `/docs/architecture/RLS_EXPLAINED.md` for more details.

## Prerequisites

- ✅ Supabase CLI installed (already done via Homebrew)
- ✅ Supabase project linked (project ref: vqgwzzzjlswyagncyhih)
- ✅ Database migrations completed (15 tables created)

## Method 1: Using Supabase CLI (Recommended)

### Step 1: Set Access Token

```bash
export SUPABASE_ACCESS_TOKEN="sbp_e5489c4906402b4e2ba511fd4a2a36689612213b"
```

### Step 2: Generate Types

```bash
cd /Users/geetadesaraju/bootcamp2510/your_workspace/sprint4/r2m-marketplace

npx supabase gen types typescript --project-id vqgwzzzjlswyagncyhih --schema public > src/types/database.types.ts
```

### Step 3: Verify Types Generated

```bash
cat src/types/database.types.ts
```

You should see TypeScript interfaces for all 15 tables.

## Method 2: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/vqgwzzzjlswyagncyhih/api
2. Scroll down to **"Generate Types"**
3. Select **"TypeScript"**
4. Click **"Generate Types"**
5. Copy the generated code
6. Paste into `src/types/database.types.ts`

## Method 3: One-Line Command (Combine All Steps)

```bash
export SUPABASE_ACCESS_TOKEN="sbp_e5489c4906402b4e2ba511fd4a2a36689612213b" && cd /Users/geetadesaraju/bootcamp2510/your_workspace/sprint4/r2m-marketplace && npx supabase gen types typescript --project-id vqgwzzzjlswyagncyhih --schema public > src/types/database.types.ts && echo "✅ Types generated successfully!"
```

## What Gets Generated?

The generated file will look like this:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: string
          company_name: string | null
          role: string | null
          avatar_url: string | null
          subscription_tier: string | null
          subscription_status: string | null
          cvs_reports_used: number | null
          cvs_reports_limit: number | null
          subscription_renews_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type: string
          company_name?: string | null
          // ... etc
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          // ... etc
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          id: string
          uploaded_by: string
          title: string
          authors: string[] | null
          abstract: string | null
          // ... all columns
        }
        Insert: {
          // ... insert fields
        }
        Update: {
          // ... update fields
        }
        Relationships: [
          {
            foreignKeyName: "research_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... all 15 tables
    }
    Views: {
      deal_pipeline: {
        Row: {
          deal_id: string | null
          status: string | null
          progress: number | null
          // ... all view columns
        }
        Relationships: []
      }
      marketplace_opportunities: {
        Row: {
          paper_id: string | null
          title: string | null
          // ... all view columns
        }
        Relationships: []
      }
    }
    Functions: {
      // ... any public functions
    }
    Enums: {
      // ... any enum types
    }
    CompositeTypes: {
      // ... any composite types
    }
  }
}
```

## Using Generated Types in Your Code

### Import Types

```typescript
import { Database } from '@/types/database.types'
```

### Create Typed Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Type-Safe Queries

```typescript
// Select with autocomplete
const { data } = await supabase
  .from('research_papers')
  .select('title, authors, abstract')
  //      ^ Autocomplete shows all available columns!

// Insert with type checking
const { data, error } = await supabase
  .from('research_papers')
  .insert({
    uploaded_by: userId,
    title: 'My Paper',
    // TypeScript error if you forget required fields!
  })

// Update with type checking
const { data, error } = await supabase
  .from('research_papers')
  .update({
    citation_count: "100" // ERROR! Should be number, not string
  })
```

### Extract Row Types

```typescript
import { Database } from '@/types/database.types'

// Get the type for a single row
type ResearchPaper = Database['public']['Tables']['research_papers']['Row']
type CVSAnalysis = Database['public']['Tables']['cvs_analyses']['Row']
type DealPipeline = Database['public']['Views']['deal_pipeline']['Row']

// Use in your components
interface Props {
  paper: ResearchPaper
  analysis: CVSAnalysis
}
```

## When to Regenerate Types

Regenerate types whenever you:

- ✅ Create or drop tables
- ✅ Add or remove columns
- ✅ Change column types
- ✅ Add or remove views
- ✅ Modify function signatures

**Don't need to regenerate when:**
- ❌ Only inserting/updating data
- ❌ Modifying RLS policies (doesn't affect structure)

## Troubleshooting

### Error: "Cannot find module '@/types/database.types'"

**Solution:** Make sure the file was created at `src/types/database.types.ts`

### Error: "SUPABASE_ACCESS_TOKEN not set"

**Solution:** Export the access token first:
```bash
export SUPABASE_ACCESS_TOKEN="sbp_e5489c4906402b4e2ba511fd4a2a36689612213b"
```

### Error: "Project not found"

**Solution:** Verify project is linked:
```bash
supabase link --project-ref vqgwzzzjlswyagncyhih
```

### Empty or Incorrect Types Generated

**Solution:** Ensure migrations have been run successfully. Check in Supabase dashboard that all 15 tables exist.

## Alternative: Manual Type Generation Script

Create a script for easy regeneration:

```bash
# scripts/generate-types.sh
#!/bin/bash

export SUPABASE_ACCESS_TOKEN="sbp_e5489c4906402b4e2ba511fd4a2a36689612213b"

echo "🔄 Generating TypeScript types from Supabase..."

npx supabase gen types typescript \
  --project-id vqgwzzzjlswyagncyhih \
  --schema public > src/types/database.types.ts

if [ $? -eq 0 ]; then
  echo "✅ Types generated successfully at src/types/database.types.ts"
else
  echo "❌ Failed to generate types"
  exit 1
fi
```

Make it executable:
```bash
chmod +x scripts/generate-types.sh
```

Run it:
```bash
./scripts/generate-types.sh
```

## Add to package.json

```json
{
  "scripts": {
    "types:generate": "supabase gen types typescript --project-id vqgwzzzjlswyagncyhih --schema public > src/types/database.types.ts"
  }
}
```

Then run:
```bash
npm run types:generate
```

## Files

- **Generated types:** `src/types/database.types.ts`
- **Database schema:** `supabase/DATABASE_SCHEMA.dbml`
- **Migrations:** `supabase/migrations/`
- **This guide:** `supabase/GENERATE_TYPES.md`

## Next Steps

After generating types:

1. ✅ Update Supabase client to use typed client
2. ✅ Add type imports to your components
3. ✅ Test autocomplete in your editor
4. ✅ Enjoy type safety! 🎉
