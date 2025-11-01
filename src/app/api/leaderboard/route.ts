import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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
        available_tokens,
        total_tokens
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
      `);

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
    
    // Fetch current pitch market data (prices)
    const { data: pitchMarketData, error: marketError } = await supabase
      .from('pitch_market_data')
      .select('pitch_id, current_price')
      .in('pitch_id', pitchIds);

    if (marketError) {
      console.error('Error fetching market data:', marketError);
      // Continue anyway with empty market data
    }

    // Create a map of pitch_id to current price
    const pitchPrices: Record<number, number> = {};
    pitchMarketData?.forEach(pm => {
      pitchPrices[pm.pitch_id] = pm.current_price || 0;
    });

    // Calculate portfolio value for each investor
    const leaderboardData = investors?.map(investor => {
      // Calculate holdings value
      const userInvestments = investments?.filter(inv => inv.user_id === investor.user_id) || [];
      const holdingsValue = userInvestments.reduce((sum, inv) => {
        // Use current_value from database if available, otherwise calculate
        const value = inv.current_value || ((inv.shares_owned || 0) * (pitchPrices[inv.pitch_id] || 0));
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
        cash: investor.available_tokens || 0,
        holdingsValue,
        portfolioValue,
        holdings: userInvestments.map(inv => ({
          ticker: `PITCH-${inv.pitch_id}`, // Show pitch ID as ticker
          shares: inv.shares_owned,
          currentPrice: pitchPrices[inv.pitch_id] || 0,
          value: inv.current_value || ((inv.shares_owned || 0) * (pitchPrices[inv.pitch_id] || 0))
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
