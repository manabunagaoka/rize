import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Fetch all competitions with stats
    const { data: competitions, error } = await supabase
      .from('competition_stats')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[COMPETITIONS API] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch competitions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      competitions: competitions || []
    });

  } catch (error) {
    console.error('[COMPETITIONS API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
