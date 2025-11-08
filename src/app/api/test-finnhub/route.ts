import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const ticker = 'MSFT';
  const apiKey = process.env.STOCK_API_KEY;
  
  console.log('[Test Finnhub] API Key exists:', !!apiKey);
  console.log('[Test Finnhub] API Key length:', apiKey?.length);
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'STOCK_API_KEY not configured',
      env_keys: Object.keys(process.env).filter(k => k.includes('STOCK') || k.includes('API'))
    });
  }
  
  try {
    const timestamp = Date.now();
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}&_=${timestamp}`;
    
    console.log('[Test Finnhub] Fetching from:', url.replace(apiKey, 'REDACTED'));
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('[Test Finnhub] Response status:', response.status);
    console.log('[Test Finnhub] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('[Test Finnhub] Response data:', data);
    
    return NextResponse.json({
      success: true,
      ticker,
      status: response.status,
      data,
      timestamp: new Date().toISOString(),
      price: data.c,
      valid: !!(data.c && data.c > 0)
    });
  } catch (error: any) {
    console.error('[Test Finnhub] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
