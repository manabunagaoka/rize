# MM7 Index - Manaboodle Magnificent 7

An investment competition platform where users compete against AI investors across multiple market indexes. Build your portfolio, unlock new markets, and win the chance to invest in your own startup!

<!-- Testing deployment: Nov 5, 2025 -->

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Custom SSO via manaboodle.com
- **Database:** Supabase (PostgreSQL)
- **Stock Data:** Finnhub API (real-time market prices)
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📋 Features

1. **Investor Leaderboard** - Compete against 7 AI investors and other users
2. **Multiple Indexes** - HM7 (Harvard Magnificent 7), H2026, S&P7, DowJ7, and more
3. **Real-Time Trading** - Buy and sell stocks with real market prices
4. **Progressive Unlock System** - Achieve +10%, +20% gains to unlock new indexes
5. **Startup Registration** - Submit your startup and get your own index
6. **Portfolio Tracking** - Monitor your holdings, gains/losses, and transaction history
7. **Username System** - Create your investor identity

## 🔐 Authentication

This app uses **Manaboodle SSO** for authentication:

- SSO endpoints hosted on `manaboodle.com`
- Middleware handles automatic redirects
- User data available via headers in Server Components and API routes
- No passwords stored in this app

### Public Routes (No Login Required):
- `/` - Landing page
- `/leaderboard` - Public leaderboard

### Protected Routes (Login Required):
- `/submit` - Submit your project
- `/my-projects` - View your submissions
- `/admin` - Admin dashboard

## 📦 Project Structure

```
rize/
├── middleware.ts              # SSO authentication
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css       # Global styles
│   │   ├── submit/           # Project submission (protected)
│   │   ├── leaderboard/      # Public leaderboard
│   │   ├── my-projects/      # User's projects (protected)
│   │   ├── admin/            # Admin dashboard (protected)
│   │   └── api/              # API routes
│   ├── components/           # React components
│   └── lib/
│       ├── auth.ts           # Auth utilities (getUser)
│       └── supabase.ts       # Supabase client
├── supabase/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Seed data (Top 10 startups)
└── package.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 3. Setup Supabase Database

1. Go to your Supabase project
2. Run the SQL from `supabase/schema.sql` in the SQL Editor
3. Run the seed data from `supabase/seed.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Using Authentication

### In Server Components:

```typescript
import { getUser } from '@/lib/auth';

export default async function MyPage() {
  const user = await getUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

### In API Routes:

```typescript
import { getUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your API logic here
  return NextResponse.json({ message: `Hello ${user.name}` });
}
```

## 🗄️ Database Schema

### Tables:

1. **top_startups** - Historical Top 10 Harvard startups (pre-populated)
2. **startup_votes** - Votes on Top 10 companies
3. **student_projects** - Student project submissions
4. **project_votes** - Votes on student projects

### Voting Criteria (1-5 stars):

1. Market Opportunity
2. Innovation/Uniqueness
3. Execution Difficulty
4. Scalability Potential
5. Social Impact

## 🚀 Deployment

### Deploy to Vercel:

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Deploy!

### Post-Deployment:

- Test SSO flow in production
- Verify middleware redirects work
- Test voting and submission features
- Monitor logs for errors

## 📚 Development Roadmap

**STEP 1:** ✅ Project Setup & SSO Integration
- Next.js 14 + TypeScript + Tailwind
- Middleware for SSO authentication
- Auth utilities and Supabase client

**STEP 2:** Database & Seed Data (Next)
- Create schema.sql with all tables
- Create seed.sql with Top 10 startups
- Test database connection

**STEP 3:** Core Components
- TopStartupCard, VotingModal, ProgressTracker
- SubmitProjectForm, LeaderboardTable
- Match projectrpl styling patterns

**STEP 4:** Pages
- Landing page with Top 10 + voting
- Submit form (protected)
- Leaderboard (public)
- My Projects (protected)
- Admin dashboard (protected)

**STEP 5:** API Routes
- Vote on startups and projects
- Get voting progress
- Submit projects
- Leaderboard rankings

**STEP 6:** Polish & Deploy
- Loading states, error handling
- Mobile responsive
- Success animations
- SEO optimization
- Production deployment

## 🤝 Contributing

This is a private project for Harvard students. Contact Manaboodle for access.

## 📄 License

Proprietary - © 2025 Manaboodle
