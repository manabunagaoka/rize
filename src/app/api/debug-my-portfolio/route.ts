import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Get user from Manaboodle SSO
    const token = request.cookies.get('manaboodle_sso_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        hint: 'manaboodle_sso_token cookie not found',
        cookies: request.cookies.getAll().map(c => c.name)
      }, { status: 401 });
    }

    // Verify with Manaboodle
    const response = await fetch('https://www.manaboodle.com/api/sso/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'SSO verification failed' }, { status: 401 });
    }

    const data = await response.json();
    const ssoUser = data.user || data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Check user_token_balances (main table)
    const { data: balance } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_email', ssoUser.email)
      .single();

    if (!balance) {
      return NextResponse.json({ 
        error: 'User not found in user_token_balances',
        ssoEmail: ssoUser.email,
        hint: 'Have you made any trades yet? User is created on first investment.'
      }, { status: 404 });
    }

    // Get user's investments
    const { data: investments } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', balance.user_id)
      .order('pitch_id');
    
    // Get ALL investments including zero shares (to find duplicates)
    const { data: allInvestments } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', balance.user_id)
      .order('pitch_id');

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', balance.user_id)
      .order('id', { ascending: false })
      .limit(10);

    return NextResponse.json({
      user: {
        id: balance.user_id,
        email: balance.user_email,
        username: balance.username
      },
      balance,
      investments,
      allInvestments,
      investment_count: investments?.length || 0,
      all_investment_count: allInvestments?.length || 0,
      recentTransactions: transactions
    });

  } catch (error) {
    console.error('Debug portfolio error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio', details: error },
      { status: 500 }
    );
  }
}
