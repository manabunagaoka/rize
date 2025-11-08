import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  try {
    const user = await verifyUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get ALL investments for this user (no filters)
    const { data: allInvestments, error: allError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id);

    // Get investments with shares > 0
    const { data: activeInvestments, error: activeError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .gt('shares_owned', 0);

    // Get balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get transactions
    const { data: transactions, error: transError } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Calculate performance both ways
    const tickerMap: { [key: number]: string } = {
      1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM', 5: 'RDDT',
      6: 'WRBY', 7: 'BKNG'
    };

    // Fetch current prices
    const prices: Record<number, number> = {};
    if (activeInvestments) {
      for (const inv of activeInvestments) {
        const ticker = tickerMap[inv.pitch_id];
        if (ticker && process.env.STOCK_API_KEY) {
          try {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.STOCK_API_KEY}`,
              { cache: 'no-store' }
            );
            const data = await response.json();
            prices[inv.pitch_id] = data.c && data.c > 0 ? data.c : 100;
          } catch {
            prices[inv.pitch_id] = 100;
          }
        }
      }
    }

    // PORTFOLIO API CALCULATION
    const portfolioInvestments = activeInvestments?.map(inv => {
      const currentPrice = prices[inv.pitch_id] || 100;
      const currentValue = Math.floor(parseFloat(inv.shares_owned) * currentPrice);
      const unrealizedGainLoss = currentValue - inv.total_invested;
      return {
        pitch_id: inv.pitch_id,
        ticker: tickerMap[inv.pitch_id],
        shares: parseFloat(inv.shares_owned),
        price: currentPrice,
        total_invested: inv.total_invested,
        current_value: currentValue,
        gain_loss: unrealizedGainLoss
      };
    }) || [];

    const portfolioHoldingsValue = portfolioInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
    const portfolioTotalGainLoss = portfolioInvestments.reduce((sum, inv) => sum + inv.gain_loss, 0);
    const portfolioTotalValue = (balance?.available_tokens || 0) + portfolioHoldingsValue;
    const portfolioPerformance = ((portfolioTotalValue - 1000000) / 1000000 * 100).toFixed(2);

    // LEADERBOARD API CALCULATION  
    const leaderboardInvestments = activeInvestments?.map(inv => {
      const currentPrice = prices[inv.pitch_id] || 100;
      const value = Math.floor((inv.shares_owned || 0) * currentPrice);
      return {
        pitch_id: inv.pitch_id,
        ticker: tickerMap[inv.pitch_id],
        shares: inv.shares_owned,
        price: currentPrice,
        value
      };
    }) || [];

    const leaderboardHoldingsValue = leaderboardInvestments.reduce((sum, inv) => sum + inv.value, 0);
    const leaderboardTotalValue = (balance?.available_tokens || 0) + leaderboardHoldingsValue;
    const leaderboardPerformance = ((leaderboardTotalValue - 1000000) / 1000000 * 100).toFixed(2);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      balance: balance || null,
      balanceError: balanceError?.message || null,
      allInvestments: allInvestments || [],
      allInvestmentsCount: allInvestments?.length || 0,
      allInvestmentsError: allError?.message || null,
      activeInvestments: activeInvestments || [],
      activeInvestmentsCount: activeInvestments?.length || 0,
      activeInvestmentsError: activeError?.message || null,
      recentTransactions: transactions || [],
      transactionsError: transError?.message || null,
      
      // PERFORMANCE COMPARISON
      performance_comparison: {
        cash: balance?.available_tokens || 0,
        prices_fetched: prices,
        
        portfolio_api_calc: {
          investments: portfolioInvestments,
          holdings_value: portfolioHoldingsValue,
          total_gain_loss: portfolioTotalGainLoss,
          total_value: portfolioTotalValue,
          performance_pct: portfolioPerformance + '%'
        },
        
        leaderboard_api_calc: {
          investments: leaderboardInvestments,
          holdings_value: leaderboardHoldingsValue,
          total_value: leaderboardTotalValue,
          performance_pct: leaderboardPerformance + '%'
        },
        
        difference: {
          holdings_diff: portfolioHoldingsValue - leaderboardHoldingsValue,
          total_diff: portfolioTotalValue - leaderboardTotalValue,
          performance_diff: (parseFloat(portfolioPerformance) - parseFloat(leaderboardPerformance)).toFixed(4) + '%',
          are_they_equal: portfolioTotalValue === leaderboardTotalValue
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
