# Cache Issue - November 8, 2025

## Problem
Portfolio prices show $100 (fallback) or stale prices when navigating back to Manage page after trading. Prices refresh correctly after **exactly 60 seconds** or when switching browser tabs.

## Root Cause (Suspected)
**Vercel Function Caching** - Despite all our cache-busting efforts, there's a 60-second cache somewhere in Vercel's infrastructure that we cannot override with headers or query parameters.

## What We've Tried

### 1. ✅ Fixed Invalid Finnhub API Key
- Old key was invalid/expired
- Updated with new working key
- Test endpoint confirms Finnhub returns real prices

### 2. ✅ Added Cache-Busting Headers (Server-Side)
```typescript
headers: {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
}
```

### 3. ✅ Added Aggressive Client-Side Cache Busting
```typescript
const cacheBuster = `${Date.now()}.${Math.random()}`;
fetch(`/api/portfolio?t=${cacheBuster}&nocache=1`, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  }
})
```

### 4. ✅ Added Force-Dynamic Exports
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
```

### 5. ✅ Added Pathname Change Detection
- Detects navigation back to /manage
- Clears stale data
- Triggers fresh fetch with delay for DB replication

### 6. ✅ Added Tab Visibility Listeners
- Refreshes when user returns to tab (THIS WORKS!)
- Refreshes on window focus

## What Works
- ✅ Tab switching triggers refresh with real prices
- ✅ Manual refresh button works
- ✅ Waiting 60 seconds then navigating works
- ✅ Test endpoint shows Finnhub returns real prices
- ✅ Trade page shows correct current prices

## What Doesn't Work
- ❌ Navigating from Trade → Manage shows $100 (for ~60 seconds)
- ❌ After trading, returning to Manage shows stale prices (for ~60 seconds)

## The 60-Second Pattern
The fact that it's **exactly 60 seconds** suggests:
1. **Vercel Functions have a default 60s cache** that can't be overridden with headers
2. **Supabase connection pooling** might cache query results for 60s
3. **Some middleware or proxy** between client and API is caching

## Potential Solutions (Not Yet Tried)

### Option 1: Disable Vercel Function Caching in Dashboard
- Go to Vercel Dashboard → Project Settings → Functions
- Look for caching settings
- May need to contact Vercel support

### Option 2: Use Edge Runtime
Change API routes to use Edge Runtime which has different caching behavior:
```typescript
export const runtime = 'edge';
```

### Option 3: Add Vercel Config
Add to `vercel.json`:
```json
{
  "functions": {
    "api/portfolio.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    }
  ]
}
```

### Option 4: Server-Side Polling
Instead of client fetching, make the server push updates via:
- Server-Sent Events (SSE)
- WebSockets
- Polling with short intervals

### Option 5: Bypass API Routes
Fetch directly from Supabase in the client component (not recommended for security)

## Current Workaround
Users can switch to another browser tab and back to trigger the visibility listener, which fetches fresh data immediately.

## Files Modified Today
- `/src/app/api/portfolio/route.ts` - Added CDN cache headers, aggressive cache busting
- `/src/app/api/leaderboard/route.ts` - Added CDN cache headers
- `/src/app/api/invest/route.ts` - Added cache-busting headers
- `/src/app/api/sell/route.ts` - Added cache-busting headers
- `/src/app/api/stock/[ticker]/route.ts` - Added cache-busting, better error handling
- `/src/components/Portfolio.tsx` - Added pathname detection, visibility listeners, aggressive cache-busting
- `/src/app/compete/page.tsx` - Added cache-busting
- `/src/app/manage/page.tsx` - Added force-dynamic export
- `/src/app/trade/page.tsx` - Added force-dynamic export

## Next Steps
1. Try Edge Runtime (Option 2)
2. Add Vercel config headers (Option 3)
3. Contact Vercel support about function caching
4. Consider alternative architecture (SSE/WebSockets)
