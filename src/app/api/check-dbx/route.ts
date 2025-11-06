import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const userEmail = 'manabunagaoka@gse.harvard.edu';

  // Get user ID from email
  const { data: userData } = await supabase
    .from('user_token_balances')
    .select('user_id')
    .eq('user_email', userEmail)
    .single();

  if (!userData) {
    return NextResponse.json({ error: 'User not found' });
  }

  const userId = userData.user_id;

  // Check for ANY Dropbox investment (pitch_id = 3)
  const { data: allDBX } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', userId)
    .eq('pitch_id', 3);

  // Check Dropbox transactions
  const { data: dbxTransactions } = await supabase
    .from('investment_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('pitch_id', 3)
    .order('timestamp', { ascending: false });

  return NextResponse.json({
    userId,
    dbxInvestments: allDBX,
    dbxTransactions,
    summary: {
      totalInvestments: allDBX?.length || 0,
      totalTransactions: dbxTransactions?.length || 0,
      totalBought: dbxTransactions?.filter(t => t.transaction_type === 'BUY').reduce((sum, t) => sum + t.shares, 0) || 0,
      totalSold: dbxTransactions?.filter(t => t.transaction_type === 'SELL').reduce((sum, t) => sum + t.shares, 0) || 0
    }
  });
}
