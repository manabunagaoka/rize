import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = getSupabaseServer();
  
  // Fetch investments exactly like leaderboard does
  const { data: investments, error } = await supabase
    .from('user_investments')
    .select(`
      user_id,
      pitch_id,
      shares_owned,
      current_value
    `)
    .gt('shares_owned', 0);
  
  const manaManaInvestments = investments?.filter(
    inv => inv.user_id === '19be07bc-28d0-4ac6-956b-714eef1ccc85'
  ) || [];
  
  return NextResponse.json({
    totalInvestmentsFetched: investments?.length,
    manaManaCount: manaManaInvestments.length,
    manaManaInvestments: manaManaInvestments.map(inv => ({
      pitch_id: inv.pitch_id,
      shares: inv.shares_owned
    })),
    error: error?.message
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
