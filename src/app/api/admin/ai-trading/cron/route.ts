import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Vercel Cron endpoint for automated AI trading
 * Runs twice daily:
 * - 2:30pm UTC (9:30am EST) - 1 hour after market open
 * - 8:30pm UTC (3:30pm EST) - 30 min before market close
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[AI Trading Cron] Starting automated trading run...');

    // Call the trigger endpoint internally
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/admin/ai-trading/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-cron-token'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    console.log('[AI Trading Cron] Completed:', {
      success: response.ok,
      results: data.results?.length || 0
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tradesExecuted: data.results?.length || 0,
      results: data.results
    });
  } catch (error) {
    console.error('[AI Trading Cron] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
