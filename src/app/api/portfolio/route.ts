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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

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

    // Get user's investments with company details
    const { data: investments, error: investError } = await supabase
      .from('user_investments')
      .select(`
        *,
        pitch:pitch_id (
          id,
          title,
          founder,
          description
        )
      `)
      .eq('user_id', user.id)
      .gt('shares_owned', 0);

    if (investError) {
      console.error('Investment fetch error:', investError);
    }

    // Get current market prices for all investments
    const investmentsWithPrices = await Promise.all(
      (investments || []).map(async (inv) => {
        const { data: marketData } = await supabase
          .from('pitch_market_data')
          .select('current_price')
          .eq('pitch_id', inv.pitch_id)
          .single();

        return {
          ...inv,
          current_price: marketData?.current_price || 100
        };
      })
    );

    return NextResponse.json({
      balance: {
        total_tokens: balance.total_tokens,
        available_tokens: balance.available_tokens,
        portfolio_value: balance.portfolio_value,
        all_time_gain_loss: balance.all_time_gain_loss,
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
