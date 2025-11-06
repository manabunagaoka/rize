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

    // Get user info from our database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', ssoUser.email)
      .single();

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found in database',
        ssoEmail: ssoUser.email 
      }, { status: 404 });
    }

    // Get user's investments
    const { data: investments } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id);

    // Get user's balance
    const { data: balance } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(10);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      balance,
      investments,
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
