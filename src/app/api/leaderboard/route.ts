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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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

    // Fetch all user investments (stock holdings)
    const { data: investments, error: investmentsError } = await supabase
      .from('user_investments')
      .select('user_id, ticker_symbol, shares_owned');

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      );
    }

    // Get unique ticker symbols to fetch current prices
    const tickersSet = new Set<string>();
    investments?.forEach(inv => tickersSet.add(inv.ticker_symbol));
    const tickers = Array.from(tickersSet);
    
    // Fetch current stock prices from Finnhub
    const stockPrices: Record<string, number> = {};
    await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
          );
          const data = await response.json();
          stockPrices[ticker] = data.c || 0; // Current price
        } catch (error) {
          console.error(`Error fetching price for ${ticker}:`, error);
          stockPrices[ticker] = 0;
        }
      })
    );

    // Calculate portfolio value for each investor
    const leaderboardData = investors?.map(investor => {
      // Calculate holdings value
      const userInvestments = investments?.filter(inv => inv.user_id === investor.user_id) || [];
      const holdingsValue = userInvestments.reduce((sum, inv) => {
        const stockValue = (inv.shares_owned || 0) * (stockPrices[inv.ticker_symbol] || 0);
        return sum + stockValue;
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
          ticker: inv.ticker_symbol,
          shares: inv.shares_owned,
          currentPrice: stockPrices[inv.ticker_symbol] || 0,
          value: (inv.shares_owned || 0) * (stockPrices[inv.ticker_symbol] || 0)
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

    // Find current user's position
    const currentUserData = rankedLeaderboard.find(inv => inv.userId === user.id);
    
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
