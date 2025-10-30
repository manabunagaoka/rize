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

// POST - Sell shares
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

    // Get user's current investment
    const { data: investment, error: investmentError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('pitch_id', pitchId)
      .single();

    if (investmentError || !investment) {
      return NextResponse.json(
        { error: 'No investment found for this company' },
        { status: 404 }
      );
    }

    if (parseFloat(investment.shares_owned) < shares) {
      return NextResponse.json(
        { error: `Insufficient shares. You own ${investment.shares_owned} shares` },
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

    // Calculate current price
    const { data: priceData } = await supabase
      .rpc('calculate_share_price', { pitch_id_param: pitchId });

    const currentPrice = priceData || 100;
    const totalProceeds = Math.floor(shares * currentPrice);

    // Get user balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !balance) {
      return NextResponse.json(
        { error: 'User balance not found' },
        { status: 500 }
      );
    }

    // Update market data FIRST
    const newTotalVolume = Math.max(0, marketData.total_volume - totalProceeds);
    const newTotalShares = Math.max(0, parseFloat(marketData.total_shares_issued) - shares);
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

    // Update or delete user investment
    const newShares = parseFloat(investment.shares_owned) - shares;
    
    if (newShares <= 0) {
      // Delete investment if no shares left
      await supabase
        .from('user_investments')
        .delete()
        .eq('user_id', user.id)
        .eq('pitch_id', pitchId);
    } else {
      // Update investment
      await supabase
        .from('user_investments')
        .update({
          shares_owned: newShares,
          current_value: Math.floor(newShares * newPrice),
          unrealized_gain_loss: Math.floor(newShares * newPrice) - (investment.total_invested * (newShares / parseFloat(investment.shares_owned))),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('pitch_id', pitchId);
    }

    // Record transaction
    await supabase
      .from('investment_transactions')
      .insert({
        user_id: user.id,
        pitch_id: pitchId,
        transaction_type: 'SELL',
        shares: shares,
        price_per_share: currentPrice,
        total_amount: totalProceeds,
        balance_before: balance.available_tokens,
        balance_after: balance.available_tokens + totalProceeds
      });

    // Update user balance
    const { data: newPortfolioValue } = await supabase
      .from('user_investments')
      .select('current_value')
      .eq('user_id', user.id);
    
    const totalPortfolioValue = (newPortfolioValue || []).reduce((sum, inv) => sum + inv.current_value, 0);

    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: balance.available_tokens + totalProceeds,
        total_invested: Math.max(0, balance.total_invested - totalProceeds),
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
      transaction: {
        shares: shares,
        price: currentPrice,
        totalProceeds: totalProceeds,
        newBalance: balance.available_tokens + totalProceeds
      }
    });

  } catch (error) {
    console.error('Sell transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process sell transaction' },
      { status: 500 }
    );
  }
}
