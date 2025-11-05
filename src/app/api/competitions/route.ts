import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  try {
    // Fetch investment leaderboard (AI + real users)
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('investment_leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .limit(20);

    if (leaderboardError) {
      console.error('[COMPETITIONS API] Leaderboard error:', leaderboardError);
    }

    // Fetch company rankings
    const { data: companies, error: companiesError } = await supabase
      .from('company_rankings')
      .select(`
        *,
        pitch:pitch_id (
          id,
          title,
          founder,
          description
        )
      `)
      .order('market_rank', { ascending: true });

    if (companiesError) {
      console.error('[COMPETITIONS API] Companies error:', companiesError);
    }

    return NextResponse.json({
      leaderboard: leaderboard || [],
      companies: companies || []
    });

  } catch (error) {
    console.error('[COMPETITIONS API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
