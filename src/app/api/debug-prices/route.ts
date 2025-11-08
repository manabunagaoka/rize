import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const tickers = ['META', 'MSFT', 'DBX', 'AKAM', 'RDDT', 'WRBY', 'BKNG'];
  const apiKey = process.env.STOCK_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'No STOCK_API_KEY configured' }, { status: 500 });
  }

  const results = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const timestamp = Date.now();
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}&_=${timestamp}`,
          { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            }
          }
        );
        
        const data = await response.json();
        
        return {
          ticker,
          status: response.status,
          price: data.c || null,
          fullResponse: data,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          ticker,
          error: String(error),
          timestamp: new Date().toISOString()
        };
      }
    })
  );

  return NextResponse.json({
    results,
    apiKeyConfigured: !!apiKey,
    apiKeyPrefix: apiKey.substring(0, 6) + '...',
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
