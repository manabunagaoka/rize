import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Edge Runtime to bypass Vercel's function caching
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Verify user from Manaboodle SSO
async function verifyUser(request: NextRequest) {
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch('https://www.manaboodle.com/api/sso/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.user || data;
    
    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('SSO verification error:', error);
    return null;
  }
}

// GET - Fetch leaderboard with all investors ranked by portfolio value
export async function GET(request: NextRequest) {
  // Create fresh Supabase client to avoid caching issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
  
  try {
    const user = await verifyUser(request);
    
    // Allow unauthenticated access to leaderboard, but don't show current user data
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Not authenticated' },
    //     { status: 401 }
    //   );
    // }

        // Fetch all investors with their balances and holdings - force fresh data from PRIMARY
    const { data: investors, error: investorsError } = await supabase
      .from('user_token_balances')
      .select(`
        user_id,
        user_email,
        username,
        is_ai_investor,
        ai_nickname,
        ai_emoji,
        ai_strategy,
        ai_catchphrase,
        ai_status,
        investor_tier,
        founder_tier,
        available_tokens,
        updated_at
      `)
      .order('updated_at', { ascending: false }) // Force non-cached query
      .limit(1000); // Add limit to prevent caching

    if (investorsError) {
      console.error('Error fetching investors:', investorsError);
      return NextResponse.json(
        { error: 'Failed to fetch investors' },
        { status: 500 }
      );
    }

    // Fetch all user investments (pitch holdings) - force fresh query from PRIMARY
    // Add multiple filters to prevent any form of caching
    const veryOldDate = new Date('2020-01-01').toISOString();
    const { data: investments, error: investmentsError} = await supabase
      .from('user_investments')
      .select(`
        user_id,
        pitch_id,
        shares_owned,
        current_value,
        updated_at
      `)
      .gt('shares_owned', 0) // Only fetch positions with actual shares
      .gte('created_at', veryOldDate) // Force fresh query by adding filter
      .order('updated_at', { ascending: false }) // Order by latest updates first
      .limit(10000); // Force non-cached query

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      );
    }

    // Get unique pitch IDs to fetch current prices
    const pitchIdsSet = new Set<number>();
    investments?.forEach(inv => pitchIdsSet.add(inv.pitch_id));
    const pitchIds = Array.from(pitchIdsSet);
    
    // Ticker mapping for HM7 companies
    const tickerMap: Record<number, string> = {
      1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM', 
      5: 'RDDT', 6: 'WRBY', 7: 'BKNG'
    };
    
    // Fetch real-time prices from Finnhub
    const pitchPrices: Record<number, number> = {};
    await Promise.all(
      pitchIds.map(async (pitchId) => {
        const ticker = tickerMap[pitchId];
        if (ticker && process.env.STOCK_API_KEY) {
          try {
            const timestamp = Date.now();
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.STOCK_API_KEY}&_=${timestamp}`,
              { 
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                },
                next: { revalidate: 0 }
              }
            );
            const data = await response.json();
            console.log(`[Leaderboard] Finnhub price for ${ticker}:`, data.c);
            if (data.c && data.c > 0) {
              pitchPrices[pitchId] = data.c;
            } else {
              console.warn(`[Leaderboard] Invalid price for ${ticker}, using fallback 100`);
              pitchPrices[pitchId] = 100;
            }
          } catch (error) {
            console.error(`Error fetching price for ${ticker}:`, error);
            pitchPrices[pitchId] = 100;
          }
        } else {
          pitchPrices[pitchId] = 100;
        }
      })
    );

    // Calculate portfolio value for each investor
    const leaderboardData = investors?.map(investor => {
      // Calculate holdings value using real-time prices
      const userInvestments = investments?.filter(inv => inv.user_id === investor.user_id) || [];
      
      const holdingsValue = userInvestments.reduce((sum, inv) => {
        // Always calculate from real-time prices, not database current_value
        const value = Math.floor((inv.shares_owned || 0) * (pitchPrices[inv.pitch_id] || 100));
        return sum + value;
      }, 0);

      // Debug logging for specific user
      if (investor.user_id === '19be07bc-28d0-4ac6-956b-714eef1ccc85') {
        console.log('[Leaderboard] ManaMana data:', {
          cash: investor.available_tokens,
          cash_updated_at: investor.updated_at,
          investments_count: userInvestments.length,
          holdings_value: holdingsValue,
          total: (investor.available_tokens || 0) + holdingsValue,
          query_time: new Date().toISOString()
        });
      }

      // Portfolio value = cash + holdings
      const portfolioValue = (investor.available_tokens || 0) + holdingsValue;

      return {
        userId: investor.user_id,
        email: investor.user_email,
        username: investor.username || investor.ai_nickname || investor.user_email,
        isAI: investor.is_ai_investor || false,
        aiEmoji: investor.ai_emoji || '',
        aiStrategy: investor.ai_strategy || undefined,
        aiCatchphrase: investor.ai_catchphrase || undefined,
        aiStatus: investor.ai_status || 'ACTIVE',
        investorTier: investor.investor_tier || undefined,
        founderTier: investor.founder_tier || undefined,
        cash: investor.available_tokens || 0,
        holdingsValue,
        portfolioValue,
        holdings: userInvestments.map(inv => ({
          ticker: tickerMap[inv.pitch_id] || `PITCH-${inv.pitch_id}`, // Show real stock ticker
          shares: inv.shares_owned,
          currentPrice: pitchPrices[inv.pitch_id] || 0,
          value: Math.floor((inv.shares_owned || 0) * (pitchPrices[inv.pitch_id] || 100))
        }))
      };
    }) || [];

    // Sort by portfolio value (descending)
    leaderboardData.sort((a, b) => b.portfolioValue - a.portfolioValue);

    // Add rank to each investor
    const rankedLeaderboard = leaderboardData.map((investor, index) => ({
      ...investor,
      rank: index + 1
    }));

    // Find current user's position (only if authenticated)
    const currentUserData = user ? rankedLeaderboard.find(inv => inv.userId === user.id) : null;
    
    // Get top 7 AI investors
    const topAI = rankedLeaderboard.filter(inv => inv.isAI).slice(0, 7);

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUser: currentUserData,
      topAI,
      totalInvestors: rankedLeaderboard.length,
      timestamp: new Date().toISOString(),
      _version: 'v2025-11-08-cdn-fix',
      _serverTime: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-API-Version': 'v2025-11-08-cdn-fix'
      }
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
