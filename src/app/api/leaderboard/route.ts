import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


// Force dynamic rendering - don't pre-render at build time
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
  const supabase = getSupabaseServer();
  try {
    const user = await verifyUser(request);
    
    // Allow unauthenticated access to leaderboard, but don't show current user data
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Not authenticated' },
    //     { status: 401 }
    //   );
    // }

    // Fetch all investors with their balances and holdings
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
        available_tokens,
        total_tokens,
        investor_tier,
        investor_tier_earned_at,
        portfolio_value,
        all_time_gain_loss
      `);

    if (investorsError) {
      console.error('Error fetching investors:', investorsError);
      return NextResponse.json(
        { error: 'Failed to fetch investors' },
        { status: 500 }
      );
    }

    // Fetch all user investments (pitch holdings)
    const { data: investments, error: investmentsError } = await supabase
      .from('user_investments')
      .select(`
        user_id,
        pitch_id,
        shares_owned,
        current_value
      `)
      .gt('shares_owned', 0); // Only fetch positions with actual shares

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
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.STOCK_API_KEY}`,
              { next: { revalidate: 60 } }
            );
            const data = await response.json();
            if (data.c && data.c > 0) {
              pitchPrices[pitchId] = data.c;
            } else {
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
        aiStatus: (investor as any).ai_status || 'ACTIVE',
        investorTier: (investor as any).investor_tier || undefined,
        founderTier: (investor as any).founder_tier || undefined,
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
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
