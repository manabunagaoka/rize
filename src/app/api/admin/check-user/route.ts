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

    // Get user balance (which has user info too)
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_email', email)
      .single();

    if (balanceError || !balance) {
      return NextResponse.json({ 
        error: 'User not found', 
        details: balanceError,
        attemptedEmail: email 
      }, { status: 404 });
    }

    // Get user's investments
    const { data: investments, error: investError } = await supabase
      .from('user_investments')
      .select(`
        *,
        student_projects (ticker, company_name)
      `)
      .eq('user_id', balance.user_id);

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', balance.user_id)
      .order('id', { ascending: false })
      .limit(20);

    return NextResponse.json({
      user: {
        id: balance.user_id,
        email: balance.user_email,
        username: balance.username,
        created_at: balance.created_at
      },
      balance,
      investments: investments?.map(inv => ({
        ...inv,
        ticker: inv.student_projects?.ticker,
        company_name: inv.student_projects?.company_name
      })),
      recentTransactions: transactions,
      errors: {
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
