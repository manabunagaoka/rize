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

// GET - Fetch user's portfolio
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    
    console.log('[Portfolio API] Verified user:', user);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user balance
    console.log('[Portfolio API] Fetching balance for user_id:', user.id);
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('[Portfolio API] Balance data:', balance);
    console.log('[Portfolio API] Balance error:', balanceError);

    if (balanceError || !balance) {
      // Return default for new users
      return NextResponse.json({
        balance: {
          total_tokens: 1000000,
          available_tokens: 1000000,
          portfolio_value: 0,
          all_time_gain_loss: 0,
          total_invested: 0
        },
        investments: []
      });
    }

    // Get user's investments
    console.log('[Portfolio API] Fetching investments for user:', user.id);
    const { data: investments, error: investError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .gt('shares_owned', 0);

    console.log('[Portfolio API] Query result - investments:', investments);
    console.log('[Portfolio API] Query result - error:', investError);
    console.log('[Portfolio API] Number of investments:', investments?.length || 0);

    if (investError) {
      console.error('Investment fetch error:', investError);
    }

    // Company ticker mapping
    const tickerMap: { [key: number]: string } = {
      1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM', 5: 'RDDT',
      6: 'WRBY', 7: 'BKNG'
    };

    // Get current market prices from Finnhub (real-time stock prices)
    const investmentsWithPrices = await Promise.all(
      (investments || []).map(async (inv) => {
        const ticker = tickerMap[inv.pitch_id];
        let currentPrice = 100;
        
        if (ticker) {
          try {
            // Fetch real-time price from Finnhub API
            const apiKey = process.env.STOCK_API_KEY;
            
            if (apiKey) {
              const priceResponse = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`,
                { 
                  next: { 
                    revalidate: 60 // Cache for 1 minute (more frequent than before)
                  } 
                }
              );
              const priceData = await priceResponse.json();
              
              if (priceData.c && priceData.c > 0) {
                currentPrice = priceData.c;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${ticker}:`, error);
          }
        }

        const currentValue = Math.floor(parseFloat(inv.shares_owned) * currentPrice);
        const unrealizedGainLoss = currentValue - inv.total_invested;

        return {
          ...inv,
          shares_owned: parseFloat(inv.shares_owned),
          current_price: currentPrice,
          current_value: currentValue,
          unrealized_gain_loss: unrealizedGainLoss
        };
      })
    );

    // Calculate total portfolio value
    const totalPortfolioValue = investmentsWithPrices.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalGainLoss = investmentsWithPrices.reduce((sum, inv) => sum + inv.unrealized_gain_loss, 0);

    return NextResponse.json({
      balance: {
        total_tokens: balance.total_tokens,
        available_tokens: balance.available_tokens,
        portfolio_value: totalPortfolioValue,
        all_time_gain_loss: totalGainLoss,
        total_invested: balance.total_invested
      },
      investments: investmentsWithPrices
    });

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
