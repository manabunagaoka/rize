import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Direct SQL query - bypass all ORM caching
  const { data, error } = await supabase.rpc('get_portfolio_direct', {
    p_user_id: '19be07bc-28d0-4ac6-956b-714eef1ccc85'
  });

  if (error) {
    // Fallback to regular query if function doesn't exist
    const { data: balance } = await supabase
      .from('user_token_balances')
      .select('available_tokens')
      .eq('user_id', '19be07bc-28d0-4ac6-956b-714eef1ccc85')
      .single();

    const { data: investments } = await supabase
      .from('user_investments')
      .select('pitch_id, shares_owned')
      .eq('user_id', '19be07bc-28d0-4ac6-956b-714eef1ccc85')
      .gt('shares_owned', 0);

    const prices = { 1: 618, 2: 496, 3: 31, 4: 84, 5: 195, 6: 17, 7: 4940 };
    const holdings = investments?.reduce((sum, inv) => 
      sum + (inv.shares_owned * (prices[inv.pitch_id as keyof typeof prices] || 100)), 0) || 0;

    return NextResponse.json({
      method: 'fallback-query',
      cash: balance?.available_tokens || 0,
      holdings: Math.floor(holdings),
      total: (balance?.available_tokens || 0) + Math.floor(holdings),
      investments: investments?.map(inv => ({
        pitch_id: inv.pitch_id,
        shares: inv.shares_owned,
        price: prices[inv.pitch_id as keyof typeof prices],
        value: Math.floor(inv.shares_owned * (prices[inv.pitch_id as keyof typeof prices] || 100))
      })),
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json(data);
}
