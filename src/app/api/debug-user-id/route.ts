import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Verify user from Manaboodle SSO
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const user = await verifyUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' });
  }

  // Check what user_id is in different tables
  const { data: investments } = await supabase
    .from('user_investments')
    .select('user_id, pitch_id, shares_owned')
    .eq('user_id', user.id);

  const { data: transactions } = await supabase
    .from('investment_transactions')
    .select('user_id, pitch_id, shares, transaction_type')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(10);

  const { data: balance } = await supabase
    .from('user_token_balances')
    .select('user_id, user_email, available_tokens')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    ssoUserId: user.id,
    ssoEmail: user.email,
    investmentsFound: investments?.length || 0,
    transactionsFound: transactions?.length || 0,
    balanceFound: balance ? 'YES' : 'NO',
    investments: investments || [],
    transactions: transactions || [],
    balance: balance || null
  });
}
