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

// POST - Buy shares
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { pitchId, shares } = await request.json();

    if (!pitchId || !shares || shares <= 0) {
      return NextResponse.json(
        { error: 'Invalid pitch ID or share count' },
        { status: 400 }
      );
    }

    // Get or create user balance
    let { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !balance) {
      // Create new user balance with 1M MTK
      const { data: newBalance, error: createError } = await supabase
        .from('user_token_balances')
        .insert({
          user_id: user.id,
          user_email: user.email,
          total_tokens: 1000000,
          available_tokens: 1000000,
          is_ai_investor: false
        })
        .select()
        .single();

      if (createError || !newBalance) {
        return NextResponse.json(
          { error: 'Failed to create user balance' },
          { status: 500 }
        );
      }
      balance = newBalance;
    }

    // Get current market data
    const { data: marketData, error: marketError } = await supabase
      .from('pitch_market_data')
      .select('*')
      .eq('pitch_id', pitchId)
      .single();

    if (marketError || !marketData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Calculate share price using the pricing function
    const { data: priceData, error: priceError } = await supabase
      .rpc('calculate_share_price', { pitch_id_param: pitchId });

    if (priceError) {
      return NextResponse.json(
        { error: 'Failed to calculate price' },
        { status: 500 }
      );
    }

    const currentPrice = priceData || 100;
    const totalCost = Math.floor(shares * currentPrice);

    // Check if user has enough tokens
    if (balance.available_tokens < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient MTK balance', available: balance.available_tokens, required: totalCost },
        { status: 400 }
      );
    }

    // Update market data FIRST so the new price is available
    const newTotalVolume = marketData.total_volume + totalCost;
    const newTotalShares = parseFloat(marketData.total_shares_issued) + shares;
    const newPrice = 100 * (1 + newTotalVolume / 1000000);

    await supabase
      .from('pitch_market_data')
      .update({
        current_price: newPrice,
        total_volume: newTotalVolume,
        total_shares_issued: newTotalShares,
        updated_at: new Date().toISOString()
      })
      .eq('pitch_id', pitchId);

    // Get or create user investment
    const { data: existingInvestment } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('pitch_id', pitchId)
      .single();

    if (existingInvestment) {
      // Update existing investment
      const newShares = parseFloat(existingInvestment.shares_owned) + shares;
      const newTotalInvested = existingInvestment.total_invested + totalCost;
      const newAvgPrice = newTotalInvested / newShares;

      await supabase
        .from('user_investments')
        .update({
          shares_owned: newShares,
          total_invested: newTotalInvested,
          avg_purchase_price: newAvgPrice,
          current_value: Math.floor(newShares * newPrice),
          unrealized_gain_loss: Math.floor(newShares * newPrice) - newTotalInvested,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('pitch_id', pitchId);
    } else {
      // Create new investment
      await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          pitch_id: pitchId,
          shares_owned: shares,
          total_invested: totalCost,
          avg_purchase_price: currentPrice,
          current_value: totalCost, // Initial value equals amount invested
          unrealized_gain_loss: 0 // No gain/loss initially
        });
    }

    // Record transaction
    await supabase
      .from('investment_transactions')
      .insert({
        user_id: user.id,
        pitch_id: pitchId,
        transaction_type: 'BUY',
        shares: shares,
        price_per_share: currentPrice,
        total_amount: totalCost,
        balance_before: balance.available_tokens,
        balance_after: balance.available_tokens - totalCost
      });

    // Update user balance
    const newPortfolioValue = await supabase
      .from('user_investments')
      .select('current_value')
      .eq('user_id', user.id);
    
    const totalPortfolioValue = (newPortfolioValue.data || []).reduce((sum, inv) => sum + inv.current_value, 0);

    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: balance.available_tokens - totalCost,
        total_invested: balance.total_invested + totalCost,
        portfolio_value: totalPortfolioValue,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Update unique investors count
    const { count } = await supabase
      .from('user_investments')
      .select('user_id', { count: 'exact', head: true })
      .eq('pitch_id', pitchId)
      .gt('shares_owned', 0);

    await supabase
      .from('pitch_market_data')
      .update({
        unique_investors: count || 0
      })
      .eq('pitch_id', pitchId);

    return NextResponse.json({
      success: true,
      investment: {
        shares: shares,
        price: currentPrice,
        totalCost: totalCost,
        newBalance: balance.available_tokens - totalCost
      }
    });

  } catch (error) {
    console.error('Investment error:', error);
    return NextResponse.json(
      { error: 'Failed to process investment' },
      { status: 500 }
    );
  }
}
