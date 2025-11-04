import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// HM7 legendary pitches (Harvard-founded companies)
const HM7_PITCHES = [
  { id: 1, name: 'Facebook', ticker: 'META', founder: 'Mark Zuckerberg' },
  { id: 2, name: 'Microsoft', ticker: 'MSFT', founder: 'Bill Gates' },
  { id: 3, name: 'Dropbox', ticker: 'DBX', founder: 'Drew Houston' },
  { id: 4, name: 'Reddit', ticker: 'RDDT', founder: 'Steve Huffman' },
  { id: 5, name: 'Quora', ticker: 'PRIVATE', founder: 'Adam D\'Angelo' },
  { id: 6, name: 'Khan Academy', ticker: 'NONPROFIT', founder: 'Sal Khan' },
  { id: 7, name: 'Snapchat', ticker: 'SNAP', founder: 'Evan Spiegel' },
];

interface AITradeDecision {
  action: 'BUY' | 'SELL' | 'HOLD';
  pitch_id: number;
  amount_mtk?: number;
  shares?: number;
  reasoning: string;
}

async function getAIInvestors() {
  const { data, error } = await supabase
    .from('user_token_balances')
    .select('*')
    .eq('is_ai_investor', true);
  
  if (error) throw error;
  return data;
}

async function getLastTradeTime(userId: string): Promise<Date | null> {
  const { data, error } = await supabase
    .from('investment_transactions')
    .select('timestamp')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  return new Date(data.timestamp);
}

async function getAIPortfolio(userId: string) {
  const { data, error } = await supabase
    .from('user_investments')
    .select('pitch_id, shares_owned, total_invested, current_value')
    .eq('user_id', userId)
    .gt('shares_owned', 0);
  
  if (error) throw error;
  return data || [];
}

async function getCurrentPrices() {
  const { data, error } = await supabase
    .from('pitch_market_data')
    .select('pitch_id, current_price, price_change_24h')
    .in('pitch_id', HM7_PITCHES.map(p => p.id));
  
  if (error) throw error;
  return data || [];
}

// NEW: Fetch pitch content for AI analysis
async function getPitchData() {
  const { data, error } = await supabase
    .from('ai_readable_pitches')
    .select('pitch_id, company_name, ticker, elevator_pitch, fun_fact, founder_story, category, current_price, price_change_24h')
    .not('ticker', 'is', null)  // Only HM7 companies with tickers
    .order('pitch_id');
  
  if (error) {
    console.error('Error fetching pitch data:', error);
    return [];
  }
  return data || [];
}

async function getAITradeDecision(
  aiInvestor: any,
  portfolio: any[],
  pitches: any[]  // Changed from prices to pitches with full content
): Promise<AITradeDecision> {
  const portfolioSummary = portfolio.map(p => {
    const pitch = pitches.find(hp => hp.pitch_id === p.pitch_id);
    return `${pitch?.company_name}: ${p.shares_owned} shares @ $${pitch?.current_price}, invested ${p.total_invested} MTK, current value ${p.current_value} MTK`;
  }).join('\n');

  // NEW: Include pitch analysis in market data
  const marketData = pitches.map(p => {
    return `${p.company_name} (${p.ticker}) - ${p.category}
    Price: $${p.current_price} (${p.price_change_24h >= 0 ? '+' : ''}${p.price_change_24h}% today)
    Pitch: "${p.elevator_pitch}"
    Story: ${p.founder_story}
    Fun Fact: ${p.fun_fact}`;
  }).join('\n\n');

  const strategyLimits = getStrategyLimits(aiInvestor.ai_strategy, aiInvestor.available_tokens);
  
  const prompt = `You are "${aiInvestor.ai_nickname}", an AI investor with the ${aiInvestor.ai_strategy} strategy.
Your catchphrase: "${aiInvestor.ai_catchphrase}"

CURRENT STATUS:
- Available Balance: ${aiInvestor.available_tokens} MTK
- Total Portfolio Value: ${aiInvestor.portfolio_value} MTK

YOUR PORTFOLIO:
${portfolioSummary || 'No current holdings'}

INVESTMENT OPPORTUNITIES (HM7 Index - Harvard Legends):
${marketData}

STRATEGY GUIDELINES for ${aiInvestor.ai_strategy}:
${getStrategyGuidelines(aiInvestor.ai_strategy)}

ANALYSIS FRAMEWORK:
- Consider both the BUSINESS (pitch, founder story, category) AND the MARKET DATA (price, momentum)
- SELL if you have holdings that are declining, overvalued, or don't fit your strategy
- BUY if you see undervalued opportunities that match your strategy
- ${aiInvestor.ai_strategy === 'TECH_ONLY' ? 'Focus on technology companies' : ''}
- ${aiInvestor.ai_strategy === 'SAAS_ONLY' ? 'Focus on SaaS/software businesses' : ''}
- ${aiInvestor.ai_strategy === 'MOMENTUM' ? 'SELL losers quickly, BUY stocks with positive momentum' : ''}
- ${aiInvestor.ai_strategy === 'CONTRARIAN' ? 'SELL when others are buying (peaks), BUY when declining' : ''}
- ${aiInvestor.ai_strategy === 'HOLD_FOREVER' ? 'Buy and hold quality businesses long-term, rarely sell' : ''}
- ${aiInvestor.ai_strategy === 'PERFECT_TIMING' ? 'SELL at peaks, BUY at dips - focus on timing' : ''}

Make ONE trade decision combining business analysis + price trends. Respond with valid JSON:
{
  "action": "BUY" | "SELL" | "HOLD",
  "pitch_id": number (1-7),
  "shares": number (if BUY, calculate based on budget ${strategyLimits.min}-${strategyLimits.max} MTK divided by stock price),
  "reasoning": "Brief explanation referencing both the business fundamentals AND price action"
}

Important: 
- For BUY: Choose shares costing ${strategyLimits.min}-${strategyLimits.max} MTK at current price
- For SELL: Specify number of shares you own
- ${aiInvestor.ai_strategy}: Typically invest ${strategyLimits.suggestion}
- Reference specific details from the pitch/story in your reasoning
- Stay in character - be bold or conservative as appropriate`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI investor analyzing both business fundamentals and market data. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const decision = JSON.parse(completion.choices[0].message.content || '{}');
    return decision as AITradeDecision;
  } catch (error) {
    console.error('OpenAI error:', error);
    // Fallback to HOLD
    return {
      action: 'HOLD',
      pitch_id: 1,
      reasoning: 'Technical difficulties, holding position'
    };
  }
}

function getStrategyLimits(strategy: string, availableTokens: number) {
  const limits: Record<string, { min: number; max: number; suggestion: string }> = {
    'CONSERVATIVE': { 
      min: Math.floor(availableTokens * 0.05), 
      max: Math.floor(availableTokens * 0.15),
      suggestion: '5-15% per trade (small, cautious positions)'
    },
    'DIVERSIFIED': { 
      min: Math.floor(availableTokens * 0.15), 
      max: Math.floor(availableTokens * 0.25),
      suggestion: '15-25% per trade (balanced approach)'
    },
    'ALL_IN': { 
      min: Math.floor(availableTokens * 0.70), 
      max: Math.floor(availableTokens * 0.95),
      suggestion: '70-95% all at once (go big or go home!)'
    },
    'HOLD_FOREVER': { 
      min: Math.floor(availableTokens * 0.30), 
      max: Math.floor(availableTokens * 0.50),
      suggestion: '30-50% when buying (then hold forever)'
    },
    'TECH_ONLY': { 
      min: Math.floor(availableTokens * 0.20), 
      max: Math.floor(availableTokens * 0.40),
      suggestion: '20-40% per tech stock'
    },
    'SAAS_ONLY': { 
      min: Math.floor(availableTokens * 0.25), 
      max: Math.floor(availableTokens * 0.45),
      suggestion: '25-45% per SaaS play'
    },
    'MOMENTUM': { 
      min: Math.floor(availableTokens * 0.30), 
      max: Math.floor(availableTokens * 0.60),
      suggestion: '30-60% chase the trend'
    },
    'TREND_FOLLOW': { 
      min: Math.floor(availableTokens * 0.25), 
      max: Math.floor(availableTokens * 0.55),
      suggestion: '25-55% follow the momentum'
    },
    'CONTRARIAN': { 
      min: Math.floor(availableTokens * 0.20), 
      max: Math.floor(availableTokens * 0.50),
      suggestion: '20-50% buy the dip'
    },
    'PERFECT_TIMING': { 
      min: Math.floor(availableTokens * 0.15), 
      max: Math.floor(availableTokens * 0.40),
      suggestion: '15-40% precise entries/exits'
    }
  };
  return limits[strategy] || { 
    min: Math.floor(availableTokens * 0.20), 
    max: Math.floor(availableTokens * 0.30),
    suggestion: '20-30% moderate position'
  };
}

function getStrategyGuidelines(strategy: string): string {
  const guidelines: Record<string, string> = {
    'CONSERVATIVE': 'Focus on established, stable companies like Microsoft and Facebook. Small position sizes. Prefer holding over frequent trading.',
    'DIVERSIFIED': 'Spread investments across multiple companies. Balance between growth and stability. Regular rebalancing.',
    'ALL_IN': 'Pick one stock you believe in and go big. High risk, high reward. Bold moves.',
    'HOLD_FOREVER': 'Buy quality companies and never sell. Long-term value investing. Ignore short-term volatility.',
    'TECH_ONLY': 'Only invest in pure tech companies. Favor software over hardware. Growth over value.',
    'SAAS_ONLY': 'Focus on software-as-a-service businesses. Recurring revenue models. Dropbox, Microsoft.',
    'MOMENTUM': 'Buy stocks that are rising. Follow trends. Sell losers quickly.',
    'TREND_FOLLOW': 'Identify and ride trends. Buy strength, sell weakness. Watch price changes.',
    'CONTRARIAN': 'Buy what others are selling. Sell what others are buying. Go against the herd.',
    'PERFECT_TIMING': 'Try to buy low, sell high. Look for oversold opportunities and overbought exits.'
  };
  return guidelines[strategy] || 'Follow your instincts.';
}

async function executeTrade(aiInvestor: any, decision: AITradeDecision) {
  if (decision.action === 'HOLD') {
    console.log(`${aiInvestor.ai_nickname} decided to HOLD`);
    return { success: true, message: 'Holding position' };
  }

  if (decision.action === 'BUY' && decision.shares) {
    // Execute buy via investment API
    const pitch = HM7_PITCHES.find(p => p.id === decision.pitch_id);
    const { data: priceData } = await supabase
      .from('pitch_market_data')
      .select('current_price')
      .eq('pitch_id', decision.pitch_id)
      .single();

    if (!priceData) throw new Error('Price not found');

    const totalCost = decision.shares * priceData.current_price;
    const balanceBefore = aiInvestor.available_tokens;
    const balanceAfter = balanceBefore - totalCost;
    
    // ⚠️ SAFETY CHECK: Prevent over-leveraging
    if (balanceAfter < 0) {
      console.warn(`🚫 ${aiInvestor.ai_nickname} tried to buy ${decision.shares} shares of pitch ${decision.pitch_id} for $${totalCost.toFixed(2)} but only has $${balanceBefore.toFixed(2)}. Trade rejected.`);
      return { 
        success: false, 
        message: `Insufficient funds: needed $${totalCost.toFixed(2)}, available $${balanceBefore.toFixed(2)}` 
      };
    }
    
    // Insert investment transaction
    const { error } = await supabase
      .from('investment_transactions')
      .insert({
        user_id: aiInvestor.user_id,
        pitch_id: decision.pitch_id,
        transaction_type: 'BUY',
        shares: decision.shares,
        price_per_share: priceData.current_price,
        total_amount: totalCost,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;

    // Update user_investments
    const { data: existingInvestment } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', aiInvestor.user_id)
      .eq('pitch_id', decision.pitch_id)
      .single();

    if (existingInvestment) {
      const newShares = existingInvestment.shares_owned + decision.shares;
      const newInvested = existingInvestment.total_invested + totalCost;
      const newAvgPrice = newInvested / newShares;

      await supabase
        .from('user_investments')
        .update({
          shares_owned: newShares,
          total_invested: newInvested,
          avg_purchase_price: newAvgPrice,
          current_value: newShares * priceData.current_price
        })
        .eq('user_id', aiInvestor.user_id)
        .eq('pitch_id', decision.pitch_id);
    } else {
      await supabase
        .from('user_investments')
        .insert({
          user_id: aiInvestor.user_id,
          pitch_id: decision.pitch_id,
          shares_owned: decision.shares,
          total_invested: totalCost,
          avg_purchase_price: priceData.current_price,
          current_value: totalCost
        });
    }

    // Update user balance
    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: aiInvestor.available_tokens - totalCost,
        total_invested: aiInvestor.total_invested + totalCost
      })
      .eq('user_id', aiInvestor.user_id);

    return {
      success: true,
      message: `${aiInvestor.ai_nickname} bought ${decision.shares.toFixed(2)} shares of ${pitch?.name} for ${totalCost.toFixed(2)} MTK`
    };
  }

  if (decision.action === 'SELL' && decision.shares) {
    // Execute sell
    const pitch = HM7_PITCHES.find(p => p.id === decision.pitch_id);
    
    // Check current holdings
    const { data: existingInvestment } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', aiInvestor.user_id)
      .eq('pitch_id', decision.pitch_id)
      .single();

    if (!existingInvestment || existingInvestment.shares_owned < decision.shares) {
      return {
        success: false,
        message: `Insufficient shares: has ${existingInvestment?.shares_owned || 0}, tried to sell ${decision.shares}`
      };
    }

    // Get current price
    const { data: priceData } = await supabase
      .from('pitch_market_data')
      .select('current_price')
      .eq('pitch_id', decision.pitch_id)
      .single();

    if (!priceData) throw new Error('Price not found');

    const totalRevenue = decision.shares * priceData.current_price;
    const balanceBefore = aiInvestor.available_tokens;
    const balanceAfter = balanceBefore + totalRevenue;
    
    // Insert sell transaction
    const { error } = await supabase
      .from('investment_transactions')
      .insert({
        user_id: aiInvestor.user_id,
        pitch_id: decision.pitch_id,
        transaction_type: 'SELL',
        shares: decision.shares,
        price_per_share: priceData.current_price,
        total_amount: totalRevenue,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;

    // Update user_investments
    const newShares = existingInvestment.shares_owned - decision.shares;
    const soldPortion = decision.shares / existingInvestment.shares_owned;
    const newInvested = existingInvestment.total_invested * (1 - soldPortion);

    if (newShares > 0) {
      await supabase
        .from('user_investments')
        .update({
          shares_owned: newShares,
          total_invested: newInvested,
          current_value: newShares * priceData.current_price
        })
        .eq('user_id', aiInvestor.user_id)
        .eq('pitch_id', decision.pitch_id);
    } else {
      // Sold all shares, delete the investment
      await supabase
        .from('user_investments')
        .delete()
        .eq('user_id', aiInvestor.user_id)
        .eq('pitch_id', decision.pitch_id);
    }

    // Update user balance
    const soldAmount = decision.shares * existingInvestment.avg_purchase_price;
    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: balanceAfter,
        total_invested: aiInvestor.total_invested - soldAmount
      })
      .eq('user_id', aiInvestor.user_id);

    return {
      success: true,
      message: `${aiInvestor.ai_nickname} sold ${decision.shares.toFixed(2)} shares of ${pitch?.name} for ${totalRevenue.toFixed(2)} MTK`
    };
  }

  return { success: false, message: 'Invalid action' };
}

export async function POST(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const aiInvestors = await getAIInvestors();
    const pitches = await getPitchData();  // Changed from prices to pitches
    const results = [];
    
    // Cooldown period: 5 minutes for testing (300000 ms)
    const COOLDOWN_MS = 5 * 60 * 1000;

    for (const ai of aiInvestors) {
      try {
        // Check cooldown
        const lastTradeTime = await getLastTradeTime(ai.user_id);
        if (lastTradeTime) {
          const timeSinceLastTrade = Date.now() - lastTradeTime.getTime();
          if (timeSinceLastTrade < COOLDOWN_MS) {
            results.push({
              investor: ai.ai_nickname,
              decision: {
                action: 'HOLD',
                pitch_id: 1,
                reasoning: `On cooldown (${Math.round((COOLDOWN_MS - timeSinceLastTrade) / 60000)} min remaining)`
              },
              result: { success: true, message: 'Cooldown active' }
            });
            continue;
          }
        }

        const portfolio = await getAIPortfolio(ai.user_id);
        const decision = await getAITradeDecision(ai, portfolio, pitches);
        const result = await executeTrade(ai, decision);
        
        results.push({
          investor: ai.ai_nickname,
          decision,
          result
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${ai.ai_nickname}:`, error);
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        results.push({
          investor: ai.ai_nickname,
          error: errorMessage
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results 
    });
  } catch (error) {
    console.error('AI trading error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
