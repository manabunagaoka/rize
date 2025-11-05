import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if environment variables exist
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 15) || 'NOT SET',
    };

    // Try to create client
    const supabase = getSupabaseServer();

    // Try a simple query
    const { data, error, count } = await supabase
      .from('user_token_balances')
      .select('user_id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        envCheck
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working!',
      userCount: count,
      envCheck
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      }
    }, { status: 500 });
  }
}
