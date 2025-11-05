import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';
// Create Supabase client only when needed
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

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

// POST - Reset user's account to starting state
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log(`Resetting account for user: ${user.id}`);

    const supabase = getSupabaseAdmin();

    // Delete all investments
    const { error: investError } = await supabase
      .from('user_investments')
      .delete()
      .eq('user_id', user.id);

    if (investError) {
      console.error('Error deleting investments:', investError);
    }

    // Delete all transactions
    const { error: transError } = await supabase
      .from('investment_transactions')
      .delete()
      .eq('user_id', user.id);

    if (transError) {
      console.error('Error deleting transactions:', transError);
    }

    // Reset balance to starting amount
    const { error: balanceError } = await supabase
      .from('user_token_balances')
      .upsert({
        user_id: user.id,
        user_email: user.email,
        total_tokens: 1000000,
        available_tokens: 1000000,
        total_invested: 0,
        portfolio_value: 0,
        all_time_gain_loss: 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (balanceError) {
      console.error('Error resetting balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to reset balance' },
        { status: 500 }
      );
    }

    console.log(`Account reset complete for user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Account reset successfully. You now have $1,000,000 MTK.'
    });

  } catch (error) {
    console.error('Account reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset account' },
      { status: 500 }
    );
  }
}
