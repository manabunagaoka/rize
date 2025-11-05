import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


export async function GET() {
  const supabase = getSupabaseServer();
  try {
    // Get all company market data with pitch details
    const { data: marketData, error } = await supabase
      .from('pitch_market_data')
      .select(`
        *,
        pitch:pitch_id (
          id,
          title,
          founder,
          description,
          category
        )
      `)
      .order('total_volume', { ascending: false });

    if (error) {
      console.error('Market data fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch market data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      companies: marketData || []
    });

  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
