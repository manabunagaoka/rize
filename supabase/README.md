# Supabase Database Setup Guide

Complete guide for setting up the Rize database on Supabase.

## 📋 Overview

**Database:** PostgreSQL (via Supabase)  
**Tables:** 4 main tables + 2 helper views  
**Seed Data:** 10 legendary Harvard startups

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign up / Log in to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Create account or sign in with GitHub

### 1.2 Create New Project

1. Click "New Project"
2. Fill in project details:
   - **Name:** `rize-harvard-edition` (or your choice)
   - **Database Password:** Generate a strong password (SAVE THIS!)
   - **Region:** Choose closest to your users (e.g., `US East (Ohio)`)
   - **Pricing Plan:** Free tier is perfect for development
3. Click "Create new project"
4. Wait 2-3 minutes for project to initialize

---

## 🗄️ Step 2: Run Database Schema

### 2.1 Open SQL Editor

1. In your Supabase project dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**

### 2.2 Run schema.sql

1. Open `/supabase/schema.sql` from this repo
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
5. You should see: `Success. No rows returned`

### 2.3 Verify Tables Created

Run this query to check:

```sql
select table_name 
from information_schema.tables 
where table_schema = 'public' 
and table_type = 'BASE TABLE'
order by table_name;
```

You should see:
- `project_votes`
- `startup_votes`
- `student_projects`
- `top_startups`

---

## 🌱 Step 3: Populate Seed Data

### 3.1 Run seed.sql

1. Open a **new query** in SQL Editor
2. Open `/supabase/seed.sql` from this repo
3. Copy the ENTIRE contents
4. Paste into Supabase SQL Editor
5. Click **"Run"**

### 3.2 Verify Data Loaded

Run this query:

```sql
select rank, name, founder, valuation 
from top_startups 
order by rank;
```

You should see all 10 Harvard startups:
1. Meta (Facebook)
2. Microsoft
3. Stripe
4. Airbnb
5. Rippling
6. Rent the Runway
7. Care.com
8. WHOOP
9. Devoted Health
10. Modern Treasury

---

## 🔑 Step 4: Get Connection Credentials

### 4.1 Navigate to Project Settings

1. Click **"Project Settings"** (gear icon in sidebar)
2. Click **"API"** in the settings menu

### 4.2 Copy Required Values

You'll need these 3 values for your `.env.local` file:

#### **1. Project URL**
- Label: "Project URL"
- Looks like: `https://xxxxxxxxxxxxx.supabase.co`
- Copy this value

#### **2. Anon/Public Key**
- Label: "Project API keys" → "anon" "public"
- Long string starting with `eyJ...`
- This key is SAFE to use in client-side code
- Copy this value

#### **3. Service Role Key** (Secret!)
- Label: "Project API keys" → "service_role" "secret"
- Long string starting with `eyJ...`
- ⚠️ **KEEP THIS SECRET** - never commit to Git
- This key has admin privileges
- Copy this value

---

## ⚙️ Step 5: Configure Environment Variables

### 5.1 Create .env.local

In the root of your project, create `.env.local`:

```bash
cp .env.example .env.local
```

### 5.2 Fill in Values

Open `.env.local` and paste your Supabase credentials:

```bash
# Supabase Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

---

## ✅ Step 6: Test Database Connection

### 6.1 Create Test API Route

Create `src/app/api/health/route.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('top_startups')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      message: 'Database connection successful!'
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### 6.2 Test the Connection

```bash
# Start dev server
npm run dev

# Visit in browser
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Database connection successful!"
}
```

---

## 🧪 Step 7: Useful Test Queries

Run these in Supabase SQL Editor to explore your data:

### Count all startups
```sql
select count(*) from top_startups;
```

### Get all startups with details
```sql
select * from top_startups order by rank;
```

### Check if any votes exist yet
```sql
select count(*) from startup_votes;
```

### View project rankings (once projects are submitted)
```sql
select * from project_rankings limit 10;
```

### Check user voting progress
```sql
select * from user_voting_progress;
```

---

## 📊 Database Schema Summary

### Tables Created:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `top_startups` | Top 10 Harvard startups | rank, name, founder, valuation |
| `startup_votes` | Votes on Top 10 | user_id, startup_id, 5 criteria |
| `student_projects` | Student submissions | project_name, description, status |
| `project_votes` | Votes on projects | user_id, project_id, 5 criteria |

### Views Created:

| View | Purpose |
|------|---------|
| `project_rankings` | Leaderboard with scores and rankings |
| `user_voting_progress` | Track votes to unlock submission |

### Voting Criteria (1-5 stars):

1. **Market Opportunity** - Size of addressable market
2. **Innovation** - How novel is the solution
3. **Execution Difficulty** - How hard to build
4. **Scalability** - Can it grow exponentially
5. **Social Impact** - Does it make the world better

---

## 🔒 Security Notes

### Row Level Security (RLS)

Currently **disabled** - we handle authorization in the application layer via SSO middleware.

If you want to enable RLS in the future:
1. Uncomment RLS policies in `schema.sql`
2. Create custom policies for your use case
3. Test thoroughly before deploying

### API Keys

- **Anon Key:** Safe for client-side use (limited permissions)
- **Service Key:** Admin access (server-side only, never expose)

---

## 🐛 Troubleshooting

### "relation does not exist"
- Make sure you ran `schema.sql` first
- Check table names are lowercase

### "permission denied"
- Check your service key is correct
- Verify RLS policies if enabled

### Connection timeout
- Check your Supabase project is active
- Verify URL and keys are correct in `.env.local`
- Make sure you're not on a restrictive network

### Duplicate key error on seed
- Run `truncate table top_startups cascade;` first
- Then re-run `seed.sql`

---

## 🚀 Next Steps

✅ Database is ready!

Now you can:
1. **Build components** - VotingModal, TopStartupCard, etc.
2. **Create API routes** - Vote endpoints, submission handlers
3. **Build pages** - Landing page, leaderboard, submission form

See the main README.md for the full development roadmap.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Database Status:** ✅ Ready for Development!
