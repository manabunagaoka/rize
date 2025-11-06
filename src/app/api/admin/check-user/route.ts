import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, adminToken } = await request.json();
    
    // Verify admin token
    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found', details: userError }, { status: 404 });
    }

    // Get user's balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user's investments
    const { data: investments, error: investError } = await supabase
      .from('user_investments')
      .select(`
        *,
        student_projects (ticker, company_name)
      `)
      .eq('user_id', user.id);

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(20);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      },
      balance,
      investments: investments?.map(inv => ({
        ...inv,
        ticker: inv.student_projects?.ticker,
        company_name: inv.student_projects?.company_name
      })),
      recentTransactions: transactions,
      errors: {
        balanceError,
        investError,
        transError
      }
    });

  } catch (error) {
    console.error('Admin check user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user', details: error },
      { status: 500 }
    );
  }
}
