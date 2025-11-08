import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function verifyUser(request: NextRequest) {
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  if (!token) return null;

  try {
    const response = await fetch('https://www.manaboodle.com/api/sso/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const user = data.user || data;
    return { id: user.id, email: user.email };
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await verifyUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Get balance
  const { data: balance } = await supabase
    .from('user_token_balances')
    .select('available_tokens')
    .eq('user_id', user.id)
    .single();

  // Get all active investments
  const { data: investments } = await supabase
    .from('user_investments')
    .select('pitch_id, shares_owned, total_invested')
    .eq('user_id', user.id)
    .gt('shares_owned', 0)
    .order('pitch_id');

  // Use approximate prices (will be close enough)
  const prices: Record<number, number> = {
    1: 618, 2: 496, 3: 31, 4: 84, 5: 195, 6: 17, 7: 4940
  };

  const holdingsBreakdown = investments?.map(inv => ({
    pitch_id: inv.pitch_id,
    shares: inv.shares_owned,
    price: prices[inv.pitch_id] || 100,
    value: Math.floor(inv.shares_owned * (prices[inv.pitch_id] || 100))
  })) || [];

  const holdingsValue = holdingsBreakdown.reduce((sum, inv) => sum + inv.value, 0);
  const cash = balance?.available_tokens || 0;
  const total = cash + holdingsValue;

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    cash,
    holdings_breakdown: holdingsBreakdown,
    holdings_value: holdingsValue,
    total_portfolio: total,
    note: "Using approximate prices: META=$618, MSFT=$496, DBX=$31, AKAM=$84, RDDT=$195, WRBY=$17, BKNG=$4940"
  }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
