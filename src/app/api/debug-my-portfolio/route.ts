import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const ssoToken = request.cookies.get('ssoToken')?.value;
    if (!ssoToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('sso_token', ssoToken)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
