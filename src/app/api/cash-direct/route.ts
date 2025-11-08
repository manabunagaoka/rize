import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Direct SQL query to check cash balance - bypasses any caching
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        db: {
          schema: 'public',
        },
        auth: {
          persistSession: false,
        },
      }
    );

    const userId = '19be07bc-28d0-4ac6-956b-714eef1ccc85'; // ManaMana

    // Direct SQL query with explicit NOW() to force fresh read
    const { data: cashData, error: cashError } = await supabase.rpc('get_fresh_cash', {
      p_user_id: userId
    });

    if (cashError) {
      // Fallback to regular query
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_token_balances')
        .select('available_tokens, updated_at')
        .eq('user_id', userId)
        .single();

      if (balanceError) {
        return NextResponse.json({ 
          error: balanceError.message,
          fallback: 'Could not query cash balance'
        }, { status: 500 });
      }

      return NextResponse.json({
        source: 'direct_query',
        cash: balanceData.available_tokens,
        updated_at: balanceData.updated_at,
        query_time: new Date().toISOString(),
        note: 'RPC function not found, using direct query'
      });
    }

    return NextResponse.json({
      source: 'rpc_function',
      ...cashData
    });

  } catch (error: any) {
    console.error('[Cash Direct] Error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
