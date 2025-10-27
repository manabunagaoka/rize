import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker;
  const apiKey = process.env.STOCK_API_KEY;

  // If no API key, return mock data
  if (!apiKey) {
    const mockData: { [key: string]: any } = {
      'META': { c: 497.43, d: 5.23, dp: 1.06 },
      'MSFT': { c: 415.89, d: -2.15, dp: -0.51 },
      'DBX': { c: 24.67, d: 0.43, dp: 1.77 }
    };
    
    return NextResponse.json(mockData[ticker] || { c: 0, d: 0, dp: 0 });
  }

  try {
    // Fetch from Finnhub API with 5-minute cache
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`,
      { 
        next: { 
          revalidate: 300 // Cache for 5 minutes
        } 
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock price');
    }

    const data = await response.json();

    // Finnhub returns: { c: current, d: change, dp: changePercent }
    return NextResponse.json({
      c: data.c,   // current price
      d: data.d,   // change
      dp: data.dp  // change percent
    });

  } catch (error) {
    console.error(`Error fetching stock price for ${ticker}:`, error);
    
    // Return fallback mock data if API fails
    const mockData: { [key: string]: any } = {
      'META': { c: 497.43, d: 5.23, dp: 1.06 },
      'MSFT': { c: 415.89, d: -2.15, dp: -0.51 },
      'DBX': { c: 24.67, d: 0.43, dp: 1.77 }
    };
    
    return NextResponse.json(mockData[ticker] || { c: 0, d: 0, dp: 0 });
  }
}
