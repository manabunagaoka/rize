import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
  
  try {
    // Get all trades from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentTrades, error: tradesError } = await supabase
      .from('investment_transactions')
      .select('pitch_id, transaction_type, shares, price_per_share')
      .gte('timestamp', sevenDaysAgo);

    if (tradesError) throw tradesError;

    // Get pitch details with ticker mapping
    const tickerMap: Record<number, { ticker: string; name: string }> = {
      1: { ticker: 'META', name: 'Meta Platforms' },
      2: { ticker: 'MSFT', name: 'Microsoft' },
      3: { ticker: 'DBX', name: 'Dropbox' },
      4: { ticker: 'AKAM', name: 'Akamai' },
      5: { ticker: 'RDDT', name: 'Reddit' },
      6: { ticker: 'WRBY', name: 'Warby Parker' },
      7: { ticker: 'BKNG', name: 'Booking.com' }
    };

    // Calculate volume by stock
    const stockActivity = new Map<number, {
      ticker: string;
      companyName: string;
      buyVolume: number;
      sellVolume: number;
      totalVolume: number;
      netVolume: number;
      lastPrice: number;
      tradeCount: number;
    }>();

    recentTrades?.forEach(trade => {
      const pitchInfo = tickerMap[trade.pitch_id];
      if (!pitchInfo) return;

      const existing = stockActivity.get(trade.pitch_id) || {
        ticker: pitchInfo.ticker,
        companyName: pitchInfo.name,
        buyVolume: 0,
        sellVolume: 0,
        totalVolume: 0,
        netVolume: 0,
        lastPrice: trade.price_per_share,
        tradeCount: 0
      };

      const shares = parseFloat(trade.shares.toString());
      
      if (trade.transaction_type === 'BUY') {
        existing.buyVolume += shares;
        existing.netVolume += shares;
      } else {
        existing.sellVolume += shares;
        existing.netVolume -= shares;
      }
      
      existing.totalVolume += shares;
      existing.lastPrice = trade.price_per_share;
      existing.tradeCount += 1;

      stockActivity.set(trade.pitch_id, existing);
    });

    // Convert to array and sort by total volume
    const trending = Array.from(stockActivity.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5); // Top 5

    return NextResponse.json({
      trending,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    console.error('Trending stocks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending stocks', trending: [] },
      { status: 500 }
    );
  }
}
