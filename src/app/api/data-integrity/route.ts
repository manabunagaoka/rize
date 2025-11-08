import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const users = balances?.map(balance => {
      // Get user's investments from DB
      const userInvestments = investments?.filter(inv => inv.user_id === balance.user_id) || [];

      // Calculate what UI shows (using current_value from investments)
      const holdingsValue = userInvestments.reduce((sum, inv) => {
        return sum + (inv.current_value || 0);
      }, 0);

      // DB raw data
      const dbCash = balance.available_tokens || 0;
      const dbTotalInvested = balance.total_invested || 0;
      const dbHoldingsCount = userInvestments.length;

      // UI data (what APIs return)
      const uiCash = dbCash; // Portfolio API reads from same table
      const uiHoldingsValue = holdingsValue; // Calculated from investments
      const uiTotal = uiCash + uiHoldingsValue;
      const uiHoldingsCount = dbHoldingsCount; // Should match

      // Calculate discrepancies
      const cashDiff = uiCash - dbCash; // Should be 0
      const holdingsCountDiff = uiHoldingsCount - dbHoldingsCount; // Should be 0

      const hasIssues = cashDiff !== 0 || holdingsCountDiff !== 0;

      return {
        user_id: balance.user_id,
        username: balance.username || balance.ai_nickname || balance.user_email,
        ui: {
          cash: uiCash,
          holdings_value: uiHoldingsValue,
          total: uiTotal,
          holdings_count: uiHoldingsCount,
          timestamp: queryTime
        },
        db: {
          cash: dbCash,
          total_invested: dbTotalInvested,
          holdings_count: dbHoldingsCount,
          raw_investments: userInvestments.map(inv => ({
            pitch_id: inv.pitch_id,
            ticker: tickerMap[inv.pitch_id] || `PITCH-${inv.pitch_id}`,
            shares_owned: inv.shares_owned,
            avg_purchase_price: inv.avg_purchase_price,
            total_invested: inv.total_invested,
            current_value: inv.current_value,
            updated_at: inv.updated_at
          })),
          updated_at: balance.updated_at
        },
        discrepancies: {
          cash_diff: cashDiff,
          holdings_count_diff: holdingsCountDiff,
          has_issues: hasIssues
        }
      };
    }) || [];

    // Sort: users with issues first
    users.sort((a, b) => {
      if (a.discrepancies.has_issues && !b.discrepancies.has_issues) return -1;
      if (!a.discrepancies.has_issues && b.discrepancies.has_issues) return 1;
      return 0;
    });

    return NextResponse.json({
      users,
      summary: {
        total_users: users.length,
        users_with_issues: users.filter(u => u.discrepancies.has_issues).length,
        healthy_users: users.filter(u => !u.discrepancies.has_issues).length
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
