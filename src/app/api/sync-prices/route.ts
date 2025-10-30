import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mapping of pitch IDs to ticker symbols (only publicly traded companies)
const PITCH_TICKERS: Record<number, string | null> = {
  1: 'META',      // Facebook
  2: 'MSFT',      // Microsoft
  3: 'DBX',       // Dropbox
  4: 'AKAM',      // Akamai
  5: 'RDDT',      // Reddit
  6: 'WRBY',      // Warby Parker
  7: 'BKNG',      // Booking.com
};

export async function POST(request: Request) {
  try {
    // Initialize Supabase client at runtime (not at module level)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    console.log('🔄 Starting price sync...');
    
    // Fetch current prices for all public companies
    const priceUpdates = await Promise.all(
      Object.entries(PITCH_TICKERS).map(async ([pitchId, ticker]) => {
        if (!ticker) {
          // For non-public companies, keep price at $100
          return { pitchId: parseInt(pitchId), price: 100.00 };
        }

        try {
          // Fetch real stock price from our stock API
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stock/${ticker}`);
          const data = await response.json();
          
          if (data.c && data.c > 0) {
            console.log(`✅ ${ticker}: $${data.c}`);
            return { pitchId: parseInt(pitchId), price: data.c };
          } else {
            console.log(`⚠️ ${ticker}: No price data, using $100`);
            return { pitchId: parseInt(pitchId), price: 100.00 };
          }
        } catch (error) {
          console.error(`❌ Error fetching price for ${ticker}:`, error);
          return { pitchId: parseInt(pitchId), price: 100.00 };
        }
      })
    );

    // Update database with real prices
    for (const update of priceUpdates) {
      const { error } = await supabase
        .from('pitch_market_data')
        .update({ 
          current_price: update.price,
          updated_at: new Date().toISOString()
        })
        .eq('pitch_id', update.pitchId);

      if (error) {
        console.error(`Failed to update pitch ${update.pitchId}:`, error);
      }
    }

    console.log('✅ Price sync complete!');

    return NextResponse.json({ 
      success: true, 
      message: 'Prices synced successfully',
      updates: priceUpdates
    });
  } catch (error) {
    console.error('Error syncing prices:', error);
    return NextResponse.json(
      { error: 'Failed to sync prices' },
      { status: 500 }
    );
  }
}

// Allow GET requests to trigger sync as well
export async function GET(request: Request) {
  return POST(request);
}
