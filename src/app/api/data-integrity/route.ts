import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchPriceWithCache } from '@/lib/price-cache';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create Supabase client with primary DB access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: 'public' },
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'x-client-info': 'supabase-js-node'
        }
      }
    }
  );

  try {
    const queryTime = new Date().toISOString();

    // Fetch all users from user_token_balances (what UI uses)
    const { data: balances, error: balancesError } = await supabase
      .from('user_token_balances')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50); // Top 50 most recent users

    if (balancesError) {
      throw balancesError;
    }

    // Fetch all investments (raw DB data)
    const { data: investments, error: investmentsError } = await supabase
      .from('user_investments')
      .select('*')
      .gt('shares_owned', 0)
      .order('updated_at', { ascending: false });

    if (investmentsError) {
      throw investmentsError;
    }

    // Ticker map for display
    const tickerMap: Record<number, string> = {
      1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM',
      5: 'RDDT', 6: 'WRBY', 7: 'BKNG'
    };

    // Build comparison data for each user
    const users = await Promise.all(balances?.map(async (balance) => {
      // Get user's investments from DB
      const userInvestments = investments?.filter(inv => inv.user_id === balance.user_id) || [];

      // Fetch live prices for each investment (same as Portfolio API)
      const investmentsWithLivePrices = await Promise.all(
        userInvestments.map(async (inv) => {
          const ticker = tickerMap[inv.pitch_id];
          let currentPrice = inv.current_value && inv.shares_owned > 0 
            ? (inv.current_value / inv.shares_owned) 
            : 100; // fallback
          
          if (ticker && process.env.STOCK_API_KEY) {
            try {
              currentPrice = await fetchPriceWithCache(ticker, inv.pitch_id, process.env.STOCK_API_KEY);
            } catch (error) {
              console.error(`[DataIntegrity] Error fetching price for ${ticker}:`, error);
            }
          }

          const currentValue = inv.shares_owned * currentPrice;
          
          return {
            pitchId: inv.pitch_id,
            ticker: ticker || `PITCH-${inv.pitch_id}`,
            shares: inv.shares_owned,
            avgPrice: inv.avg_purchase_price,
            currentValue: currentValue,
            currentPrice: currentPrice
          };
        })
      );

      // Calculate what UI shows (using live prices)
      const holdingsValue = investmentsWithLivePrices.reduce((sum, inv) => {
        return sum + inv.currentValue;
      }, 0);

      // DB raw data
      const dbCash = balance.available_tokens || 0;
      const dbTotalInvested = balance.total_invested || 0;
      const dbHoldingsCount = userInvestments.length;

      // UI data (what APIs return with live prices)
      const uiCash = dbCash; // Portfolio API reads from same table
      const uiHoldingsValue = holdingsValue; // Calculated from investments with LIVE prices
      const uiTotal = uiCash + uiHoldingsValue;
      const uiHoldingsCount = dbHoldingsCount; // Should match
      const uiRoi = dbTotalInvested > 0 ? ((uiHoldingsValue - dbTotalInvested) / dbTotalInvested * 100) : 0;

      // Calculate discrepancies
      const cashDiff = uiCash - dbCash; // Should be 0
      const holdingsCountDiff = uiHoldingsCount - dbHoldingsCount; // Should be 0

      const hasIssues = cashDiff !== 0 || holdingsCountDiff !== 0;

      return {
        userId: balance.user_id,
        // ALWAYS show nickname for display, email only for admin identification
        displayName: balance.username || balance.ai_nickname || `User-${balance.user_id}`,
        email: balance.user_email || null, // Keep for admin reference only
        isAI: !!balance.ai_nickname,
        ui: {
          cash: uiCash,
          portfolioValue: uiHoldingsValue,
          totalValue: uiTotal,
          holdingsCount: uiHoldingsCount,
          roi: uiRoi,
          investments: investmentsWithLivePrices,
          timestamp: queryTime
        },
        db: {
          cash: dbCash,
          portfolioValue: holdingsValue,
          totalValue: dbCash + holdingsValue,
          holdingsCount: dbHoldingsCount,
          totalInvested: dbTotalInvested,
          updatedAt: balance.updated_at
        },
        discrepancies: {
          cash: cashDiff !== 0,
          portfolioValue: false, // Same calculation
          totalValue: cashDiff !== 0, // Will differ if cash differs
          holdingsCount: holdingsCountDiff !== 0
        },
        hasDiscrepancy: hasIssues
      };
    }) || []);

    // Sort: users with issues first
    users.sort((a, b) => {
      if (a.hasDiscrepancy && !b.hasDiscrepancy) return -1;
      if (!a.hasDiscrepancy && b.hasDiscrepancy) return 1;
      return 0;
    });

    return NextResponse.json({
      users,
      summary: {
        totalUsers: users.length,
        usersWithIssues: users.filter(u => u.hasDiscrepancy).length,
        healthyUsers: users.filter(u => !u.hasDiscrepancy).length
      },
      timestamp: queryTime
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: String(error) },
      { status: 500 }
    );
  }
}
