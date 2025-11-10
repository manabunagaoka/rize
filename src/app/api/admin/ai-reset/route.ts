import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, adminToken } = await request.json();
    
    // Verify admin token - must match exactly
    if (adminToken !== 'admin_secret_manaboodle_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: { persistSession: false },
        db: { schema: 'public' }
      }
    );

    // Verify user is an AI investor
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_ai_investor, nickname')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.is_ai_investor) {
      return NextResponse.json({ error: 'User is not an AI investor' }, { status: 400 });
    }

    // Reset balance to $1,000,000
    const { error: balanceError } = await supabase
      .from('users')
      .update({ tokens: 1000000 })
      .eq('id', userId);

    if (balanceError) {
      console.error('Error resetting balance:', balanceError);
      return NextResponse.json({ error: 'Failed to reset balance' }, { status: 500 });
    }

    // Clear transaction history
    const { error: transactionError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);

    if (transactionError) {
      console.error('Error clearing transactions:', transactionError);
      return NextResponse.json({ error: 'Failed to clear transaction history' }, { status: 500 });
    }

    // Clear trading logs
    const { error: logsError } = await supabase
      .from('ai_trading_logs')
      .delete()
      .eq('ai_investor_id', userId);

    if (logsError) {
      console.error('Error clearing trading logs:', logsError);
      // Non-critical, continue
    }

    console.log(`✅ Reset AI investor ${user.nickname} (${userId}) - Balance: $1M, History cleared`);

    return NextResponse.json({ 
      success: true,
      message: `Reset ${user.nickname} successfully`,
      newBalance: 1000000
    });

  } catch (error) {
    console.error('Error in ai-reset:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
