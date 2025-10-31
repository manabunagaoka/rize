import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Get count of all investments
    const { count: investCount } = await supabase
      .from('user_investments')
      .select('*', { count: 'exact', head: true });

    // Get count of active investments (shares > 0)
    const { count: activeCount } = await supabase
      .from('user_investments')
      .select('*', { count: 'exact', head: true })
      .gt('shares_owned', 0);

    // Get all investments
    const { data: allInvestments } = await supabase
      .from('user_investments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get all balances
    const { data: allBalances } = await supabase
      .from('user_token_balances')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent transactions
    const { data: recentTransactions } = await supabase
      .from('investment_transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    return NextResponse.json({
      summary: {
        totalInvestments: investCount || 0,
        activeInvestments: activeCount || 0,
        totalBalanceRecords: allBalances?.length || 0,
        totalTransactions: recentTransactions?.length || 0
      },
      investments: allInvestments || [],
      balances: allBalances || [],
      transactions: recentTransactions || []
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
