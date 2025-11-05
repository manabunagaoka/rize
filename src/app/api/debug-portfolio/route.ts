import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  try {
    const user = await verifyUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get ALL investments for this user (no filters)
    const { data: allInvestments, error: allError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id);

    // Get investments with shares > 0
    const { data: activeInvestments, error: activeError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .gt('shares_owned', 0);

    // Get balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get transactions
    const { data: transactions, error: transError } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      balance: balance || null,
      balanceError: balanceError?.message || null,
      allInvestments: allInvestments || [],
      allInvestmentsCount: allInvestments?.length || 0,
      allInvestmentsError: allError?.message || null,
      activeInvestments: activeInvestments || [],
      activeInvestmentsCount: activeInvestments?.length || 0,
      activeInvestmentsError: activeError?.message || null,
      recentTransactions: transactions || [],
      transactionsError: transError?.message || null
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
