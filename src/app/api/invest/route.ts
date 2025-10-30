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

    const { pitchId, amount } = await request.json();

    if (!pitchId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid pitch ID or amount' },
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

    // Check if user has enough tokens
    if (balance.available_tokens < amount) {
      return NextResponse.json(
        { error: 'Insufficient MTK balance', available: balance.available_tokens },
        { status: 400 }
      );
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

    const currentPrice = parseFloat(priceData || '100.00');
    const sharesPurchased = amount / currentPrice;

    // Get or create user investment
    const { data: existingInvestment } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('pitch_id', pitchId)
      .single();

    if (existingInvestment) {
      // Update existing investment
      const newShares = parseFloat(existingInvestment.shares_owned) + sharesPurchased;
      const newTotalInvested = existingInvestment.total_invested + amount;
      const newAvgPrice = newTotalInvested / newShares;

      await supabase
        .from('user_investments')
        .update({
          shares_owned: newShares,
          total_invested: newTotalInvested,
          avg_purchase_price: newAvgPrice,
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
          shares_owned: sharesPurchased,
          total_invested: amount,
          avg_purchase_price: currentPrice
        });
    }

    // Record transaction
    await supabase
      .from('investment_transactions')
      .insert({
        user_id: user.id,
        pitch_id: pitchId,
        transaction_type: 'BUY',
        shares: sharesPurchased,
        price_per_share: currentPrice,
        total_amount: amount,
        balance_before: balance.available_tokens,
        balance_after: balance.available_tokens - amount
      });

    // Update user balance
    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: balance.available_tokens - amount,
        total_invested: balance.total_invested + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Update market data
    const newTotalVolume = marketData.total_volume + amount;
    const newTotalShares = parseFloat(marketData.total_shares_issued) + sharesPurchased;
    const newPrice = 100 * (1 + newTotalVolume / 1000000);

    // Check if this is a new unique investor
    const { count } = await supabase
      .from('user_investments')
      .select('user_id', { count: 'exact', head: true })
      .eq('pitch_id', pitchId)
      .gt('shares_owned', 0);

    await supabase
      .from('pitch_market_data')
      .update({
        current_price: newPrice,
        total_volume: newTotalVolume,
        total_shares_issued: newTotalShares,
        unique_investors: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('pitch_id', pitchId);

    // Trigger portfolio value updates
    await supabase.rpc('update_portfolio_values');

    return NextResponse.json({
      success: true,
      investment: {
        shares: sharesPurchased,
        price: currentPrice,
        amount: amount,
        newBalance: balance.available_tokens - amount
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
