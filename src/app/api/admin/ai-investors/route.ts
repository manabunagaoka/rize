import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: 'public' }
    }
  );

  try {
    // Fetch all AI investors with their complete data
    const { data: aiInvestors, error: aiError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('is_ai_investor', true)
      .order('ai_nickname');

    if (aiError) throw aiError;

    // Fetch their investments
    const { data: investments, error: invError } = await supabase
      .from('user_investments')
      .select('*')
      .gt('shares_owned', 0)
      .in('user_id', aiInvestors?.map(ai => ai.user_id) || []);

    if (invError) throw invError;

    // Fetch recent transactions for each AI
    const { data: transactions, error: txError } = await supabase
      .from('investment_transactions')
      .select('*')
      .in('user_id', aiInvestors?.map(ai => ai.user_id) || [])
      .order('timestamp', { ascending: false })
      .limit(100);

    if (txError) throw txError;

    // Fetch AI trading logs (if they exist)
    const { data: tradingLogs, error: logsError } = await supabase
      .from('ai_trading_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    // Combine data
    const enrichedAIInvestors = aiInvestors?.map(ai => {
      const aiInvestments = investments?.filter(inv => inv.user_id === ai.user_id) || [];
      const aiTransactions = transactions?.filter(tx => tx.user_id === ai.user_id) || [];
      const aiLogs = tradingLogs?.filter(log => log.user_id === ai.user_id) || [];

      return {
        userId: ai.user_id,
        email: ai.user_email,
        nickname: ai.ai_nickname,
        emoji: ai.ai_emoji,
        strategy: ai.ai_strategy,
        catchphrase: ai.ai_catchphrase,
        status: ai.ai_status || 'ACTIVE',
        cash: ai.available_tokens || 0,
        portfolioValue: ai.portfolio_value || 0,
        totalValue: (ai.available_tokens || 0) + (ai.portfolio_value || 0),
        totalInvested: ai.total_invested || 0,
        totalGains: ai.total_gains || 0,
        roi: ai.total_invested > 0 ? ((ai.total_gains / ai.total_invested) * 100).toFixed(2) : '0.00',
        tier: ai.investor_tier || 'BRONZE',
        investments: aiInvestments.map(inv => ({
          pitchId: inv.pitch_id,
          shares: inv.shares_owned,
          avgPrice: inv.avg_purchase_price,
          totalInvested: inv.total_invested,
          currentValue: inv.current_value,
          gain: inv.current_value - inv.total_invested,
          gainPercent: inv.total_invested > 0 ? ((inv.current_value - inv.total_invested) / inv.total_invested * 100).toFixed(2) : '0.00',
          updatedAt: inv.updated_at
        })),
        recentTransactions: aiTransactions.slice(0, 10).map(tx => ({
          type: tx.transaction_type,
          pitchId: tx.pitch_id,
          shares: tx.shares,
          pricePerShare: tx.price_per_share,
          totalAmount: tx.total_amount,
          timestamp: tx.timestamp
        })),
        tradingLogs: aiLogs.slice(0, 5).map(log => ({
          action: log.action,
          reasoning: log.reasoning,
          pitchId: log.pitch_id,
          amount: log.amount,
          success: log.success,
          errorMessage: log.error_message,
          timestamp: log.created_at
        })),
        lastTradeTime: aiTransactions[0]?.timestamp || null,
        tradesLast24h: aiTransactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return txDate > dayAgo;
        }).length,
        updatedAt: ai.updated_at
      };
    });

    return NextResponse.json({
      aiInvestors: enrichedAIInvestors,
      summary: {
        totalAI: aiInvestors?.length || 0,
        active: aiInvestors?.filter(ai => ai.ai_status === 'ACTIVE').length || 0,
        paused: aiInvestors?.filter(ai => ai.ai_status === 'PAUSED').length || 0,
        totalValue: aiInvestors?.reduce((sum, ai) => sum + (ai.available_tokens || 0) + (ai.portfolio_value || 0), 0) || 0
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('AI Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI investor data', details: String(error) },
      { status: 500 }
    );
  }
}

// Update AI investor settings
export async function PATCH(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: 'public' }
    }
  );

  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Update AI investor in database
    const { data, error } = await supabase
      .from('user_token_balances')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('AI Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update AI investor', details: String(error) },
      { status: 500 }
    );
  }
}

// Trigger manual trade for AI investor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, pitchId, amount } = body;

    if (action === 'manual-trade') {
      // Call the AI trading execute endpoint for this specific AI
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/ai-trading/execute?user_id=${userId}&pitch_id=${pitchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        },
        body: JSON.stringify({ amount })
      });

      const result = await response.json();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('AI Action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action', details: String(error) },
      { status: 500 }
    );
  }
}
