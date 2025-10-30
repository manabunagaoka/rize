import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

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

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    console.log(`Clearing ALL data for user: ${user.id}`);

    // Delete investments
    await supabase
      .from('user_investments')
      .delete()
      .eq('user_id', user.id);

    // Delete transactions
    await supabase
      .from('investment_transactions')
      .delete()
      .eq('user_id', user.id);

    // Delete balance record entirely
    await supabase
      .from('user_token_balances')
      .delete()
      .eq('user_id', user.id);

    console.log(`✅ All data cleared for user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Account cleared. Refresh the page.'
    });

  } catch (error) {
    console.error('Clear account error:', error);
    return NextResponse.json(
      { error: 'Failed to clear account' },
      { status: 500 }
    );
  }
}
