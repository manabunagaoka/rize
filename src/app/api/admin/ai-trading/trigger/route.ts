import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { fetchPriceWithCache } from '@/lib/price-cache';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// HM7 legendary pitches (Harvard-founded companies)
const HM7_PITCHES = [
  { id: 1, name: 'Facebook', ticker: 'META', founder: 'Mark Zuckerberg' },
  { id: 2, name: 'Microsoft', ticker: 'MSFT', founder: 'Bill Gates' },
  { id: 3, name: 'Dropbox', ticker: 'DBX', founder: 'Drew Houston' },
  { id: 4, name: 'Akamai', ticker: 'AKAM', founder: 'Tom Leighton' },
  { id: 5, name: 'Reddit', ticker: 'RDDT', founder: 'Steve Huffman' },
  { id: 6, name: 'Warby Parker', ticker: 'WRBY', founder: 'Neil Blumenthal' },
  { id: 7, name: 'Booking.com', ticker: 'BKNG', founder: 'Geert-Jan Bruinsma' },
];

interface AITradeDecision {
  action: 'BUY' | 'SELL' | 'HOLD';
  pitch_id: number;
  shares?: number;
  reasoning: string;
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function getAIInvestor(supabase: any, userId?: string) {
  if (userId) {
    const { data, error } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('is_ai_investor', true)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return [data];
  } else {
    const { data, error } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('is_ai_investor', true);
    
    if (error) throw error;
    return data;
  }
}

async function getAIPortfolio(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_investments')
    .select('pitch_id, shares_owned, total_invested, current_value')
    .eq('user_id', userId)
    .gt('shares_owned', 0);
  
  if (error) throw error;
  return data || [];
}

async function getPitchData(supabase: any) {
  const { data, error } = await supabase
    .from('ai_readable_pitches')
    .select('pitch_id, company_name, ticker, elevator_pitch, fun_fact, founder_story, category, current_price, price_change_24h')
    .not('ticker', 'is', null)
    .order('pitch_id');
  
  if (error) {
    console.error('Error fetching pitch data:', error);
    return [];
  }
  
  // Fetch live prices
  const enrichedPitches = await Promise.all(data.map(async (pitch: any) => {
    let livePrice = pitch.current_price || 100;
    
    if (pitch.ticker && process.env.STOCK_API_KEY) {
      try {
        livePrice = await fetchPriceWithCache(pitch.ticker, pitch.pitch_id, process.env.STOCK_API_KEY);
      } catch (error) {
        console.error(`Error fetching price for ${pitch.ticker}:`, error);
      }
    }
    
    return {
      ...pitch,
      current_price: livePrice
    };
  }));
  
  return enrichedPitches;
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
      min: Math.floor(availableTokens * 0.80), 
      max: Math.floor(availableTokens * 0.95),
      suggestion: '80-95% all at once (GO BIG!)'
    },
    'HOLD_FOREVER': { 
      min: Math.floor(availableTokens * 0.30), 
      max: Math.floor(availableTokens * 0.50),
      suggestion: '30-50% when buying (then NEVER sell)'
    },
    'TECH_ONLY': { 
      min: Math.floor(availableTokens * 0.25), 
      max: Math.floor(availableTokens * 0.45),
      suggestion: '25-45% per tech stock'
    },
    'SAAS_ONLY': { 
      min: Math.floor(availableTokens * 0.30), 
      max: Math.floor(availableTokens * 0.50),
      suggestion: '30-50% per SaaS play'
    },
    'MOMENTUM': { 
      min: Math.floor(availableTokens * 0.60), // Increased from 40% to force action
      max: Math.floor(availableTokens * 0.90), // Increased from 80% for more aggression
      suggestion: '60-90% FOMO HARD - can\'t miss this!'
    },
    'TREND_FOLLOW': { 
      min: Math.floor(availableTokens * 0.30), 
      max: Math.floor(availableTokens * 0.60),
      suggestion: '30-60% follow the momentum'
    },
    'CONTRARIAN': { 
      min: Math.floor(availableTokens * 0.25), 
      max: Math.floor(availableTokens * 0.55),
      suggestion: '25-55% buy the dip aggressively'
    },
    'PERFECT_TIMING': { 
      min: Math.floor(availableTokens * 0.20), 
      max: Math.floor(availableTokens * 0.45),
      suggestion: '20-45% precise entries/exits'
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
    'CONSERVATIVE': 'The Boomer: ONLY invest in proven companies like Microsoft and Facebook. Small positions. Prefer holding over frequent trading. You lived through dot-com crash - never again!',
    'DIVERSIFIED': 'Steady Eddie: MUST spread investments across at least 4 different companies. Balance growth vs stability. Regular rebalancing. Never go all-in on one stock.',
    'ALL_IN': 'YOLO Kid: Pick ONE stock you believe in and BET BIG (80-95%). High risk = high reward. Fortune favors the bold! No half measures!',
    'HOLD_FOREVER': 'Diamond Hands: Buy quality and NEVER EVER SELL. Long-term value investing. Ignore ALL short-term volatility. Paper hands lose, diamond hands WIN. 💎🙌',
    'TECH_ONLY': 'Silicon Brain: ONLY pure tech companies (Facebook, Microsoft, Dropbox). NO non-tech. Growth over everything. Code is eating the world.',
    'SAAS_ONLY': 'Cloud Surfer: ONLY software-as-a-service businesses with recurring revenue. Dropbox, Microsoft yes. Hardware? NO WAY.',
    'MOMENTUM': 'FOMO Master: You HATE missing gains! Buy stocks rising 2%+. Stock falling 2%+? Consider SELLING! Sitting on >40% cash is UNACCEPTABLE - you MUST be in the market!',
    'TREND_FOLLOW': 'Hype Train: Ride trends. Buy stocks with positive momentum. Sell losers quickly. Follow the crowd to profits!',
    'CONTRARIAN': 'The Contrarian: Buy when others panic-sell (falling stocks). Sell when others FOMO-buy (rising stocks). Go against the herd ALWAYS.',
    'PERFECT_TIMING': 'The Oracle: Buy low, sell high. Look for oversold opportunities (down 5%+). Exit overbought peaks (up 8%+). Precision timing wins.'
  };
  return guidelines[strategy] || 'Follow your instincts.';
}

async function getAITradeDecision(
  aiInvestor: any,
  portfolio: any[],
  pitches: any[]
): Promise<{ decision: AITradeDecision; prompt: string; rawResponse: string }> {
  const cashPercent = (aiInvestor.available_tokens / aiInvestor.total_tokens) * 100;
  
  const portfolioSummary = portfolio.length > 0 
    ? portfolio.map(p => {
        const pitch = pitches.find(hp => hp.pitch_id === p.pitch_id);
        return `${pitch?.company_name}: ${p.shares_owned.toFixed(2)} shares @ $${pitch?.current_price?.toFixed(2)}, invested $${Math.floor(p.total_invested).toLocaleString()} MTK, current value $${Math.floor(p.current_value).toLocaleString()} MTK`;
      }).join('\n')
    : 'No current holdings - 100% cash!';

  const marketData = pitches.map(p => {
    return `${p.company_name} (${p.ticker}) - ${p.category}
    Price: $${p.current_price?.toFixed(2)} (${p.price_change_24h >= 0 ? '+' : ''}${p.price_change_24h?.toFixed(2)}% today)
    Pitch: "${p.elevator_pitch}"
    Story: ${p.founder_story}
    Fun Fact: ${p.fun_fact}`;
  }).join('\n\n');

  const strategyLimits = getStrategyLimits(aiInvestor.ai_strategy, aiInvestor.available_tokens);
  
  const prompt = `You are "${aiInvestor.ai_nickname}", an AI investor with the ${aiInvestor.ai_strategy} strategy.
Your catchphrase: "${aiInvestor.ai_catchphrase}"

⚡ CRITICAL: STAY IN CHARACTER! Be EXTREME and TRUE to your personality!

CURRENT STATUS:
- Available Cash: $${Math.floor(aiInvestor.available_tokens).toLocaleString()} MTK (${cashPercent.toFixed(1)}% of portfolio)
- Total Portfolio Value: $${Math.floor(aiInvestor.total_tokens).toLocaleString()} MTK

YOUR PORTFOLIO:
${portfolioSummary}

INVESTMENT OPPORTUNITIES (HM7 Index - Harvard Legends):
${marketData}

🎭 YOUR PERSONALITY - ${aiInvestor.ai_strategy}:
${getStrategyGuidelines(aiInvestor.ai_strategy)}

💰 TRADING RULES FOR YOU:
- Trade sizes: ${strategyLimits.suggestion}
- Budget for this trade: $${strategyLimits.min.toLocaleString()} - $${strategyLimits.max.toLocaleString()} MTK
- Make BOLD moves that match your personality!
- SELL if holdings are declining/overvalued/wrong for your strategy
- BUY if you see opportunities that match YOUR strategy

${aiInvestor.ai_strategy === 'MOMENTUM' && cashPercent > 40 ? `
🚨🚨🚨 EMERGENCY ALERT 🚨🚨🚨
YOU HAVE ${cashPercent.toFixed(1)}% CASH! This is UNACCEPTABLE for a MOMENTUM trader!
YOUR RULE: >40% cash is FORBIDDEN! You MUST trade NOW!
Look for ANY stock up even 1%+ today and BUY IMMEDIATELY!
If NOTHING is up, buy the LEAST negative stock!
DO NOT HOLD! FOMO Masters are ALWAYS in the market!
` : ''}

${aiInvestor.ai_strategy === 'MOMENTUM' ? '🚨 FOMO MASTER RULES: Stock up 2%+? BUY NOW! Stock down 2%+? Consider SELLING! You HATE missing opportunities!' : ''}
${aiInvestor.ai_strategy === 'HOLD_FOREVER' ? '💎 DIAMOND HANDS RULE: You can BUY but NEVER SELL. Selling is for paper hands!' : ''}
${aiInvestor.ai_strategy === 'ALL_IN' ? '🎲 YOLO KID RULE: Go BIG (80-95% of balance) or go home! No small positions!' : ''}
${aiInvestor.ai_strategy === 'CONTRARIAN' ? '🔄 CONTRARIAN RULE: Stock rising? Consider SELLING. Stock falling? Time to BUY!' : ''}

Make ONE bold trade decision. Respond with valid JSON only:
{
  "action": "BUY" | "SELL" | "HOLD",
  "pitch_id": number (1-7),
  "shares": number (calculate from your budget / stock price),
  "reasoning": "Brief explanation showing your personality and referencing specific pitch details or price action"
}

Important: 
- Calculate shares: (your budget) / (current stock price)
- Reference the pitch content or founder story in your reasoning
- Show your personality in the reasoning - make it CLEAR you're ${aiInvestor.ai_nickname}!
- If you have TOO MUCH cash for your strategy, you MUST trade!`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI investor analyzing both business fundamentals and market data. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const rawResponse = completion.choices[0].message.content || '{}';
    const decision = JSON.parse(rawResponse);
    
    return {
      decision: decision as AITradeDecision,
      prompt,
      rawResponse
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return {
      decision: {
        action: 'HOLD',
        pitch_id: 1,
        reasoning: `Technical difficulties: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      prompt,
      rawResponse: JSON.stringify({ error: String(error) })
    };
  }
}

async function executeTrade(supabase: any, aiInvestor: any, decision: AITradeDecision) {
  if (decision.action === 'HOLD') {
    return { success: true, message: 'Holding position' };
  }

  if (decision.action === 'BUY' && decision.shares) {
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
    
    if (balanceAfter < 0) {
      return { 
        success: false, 
        message: `Insufficient funds: needed $${totalCost.toFixed(2)}, available $${balanceBefore.toFixed(2)}` 
      };
    }
    
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

    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: balanceAfter,
        total_invested: (aiInvestor.total_invested || 0) + totalCost
      })
      .eq('user_id', aiInvestor.user_id);

    return {
      success: true,
      message: `${aiInvestor.ai_nickname} bought ${decision.shares.toFixed(2)} shares of ${pitch?.name} for $${totalCost.toFixed(2)} MTK`
    };
  }

  if (decision.action === 'SELL' && decision.shares) {
    const pitch = HM7_PITCHES.find(p => p.id === decision.pitch_id);
    
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

    const { data: priceData } = await supabase
      .from('pitch_market_data')
      .select('current_price')
      .eq('pitch_id', decision.pitch_id)
      .single();

    if (!priceData) throw new Error('Price not found');

    const totalRevenue = decision.shares * priceData.current_price;
    const balanceBefore = aiInvestor.available_tokens;
    const balanceAfter = balanceBefore + totalRevenue;
    
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
      await supabase
        .from('user_investments')
        .delete()
        .eq('user_id', aiInvestor.user_id)
        .eq('pitch_id', decision.pitch_id);
    }

    const soldAmount = decision.shares * existingInvestment.avg_purchase_price;
    await supabase
      .from('user_token_balances')
      .update({
        available_tokens: balanceAfter,
        total_invested: (aiInvestor.total_invested || 0) - soldAmount
      })
      .eq('user_id', aiInvestor.user_id);

    return {
      success: true,
      message: `${aiInvestor.ai_nickname} sold ${decision.shares.toFixed(2)} shares of ${pitch?.name} for $${totalRevenue.toFixed(2)} MTK`
    };
  }

  return { success: false, message: 'Invalid action' };
}

async function logTrade(supabase: any, aiInvestor: any, prompt: string, rawResponse: string, decision: AITradeDecision, result: any, triggeredBy: string) {
  try {
    await supabase
      .from('ai_trading_logs')
      .insert({
        user_id: aiInvestor.user_id,
        ai_nickname: aiInvestor.ai_nickname,
        ai_strategy: aiInvestor.ai_strategy,
        cash_before: aiInvestor.available_tokens,
        portfolio_value_before: aiInvestor.total_tokens,
        openai_prompt: prompt,
        openai_response_raw: rawResponse,
        decision_action: decision.action,
        decision_pitch_id: decision.pitch_id,
        decision_shares: decision.shares || null,
        decision_reasoning: decision.reasoning,
        execution_success: result.success,
        execution_error: result.success ? null : result.message,
        execution_message: result.message,
        triggered_by: triggeredBy
      });
  } catch (error) {
    console.error('Error logging trade:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth check (not cron)
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    // Simple admin check - in production, verify JWT
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { userId } = body; // If provided, test single AI
    const aiInvestors = await getAIInvestor(supabase, userId);
    const pitches = await getPitchData(supabase);
    const results = [];
    
    for (const ai of aiInvestors) {
      try {
        const portfolio = await getAIPortfolio(supabase, ai.user_id);
        
        const { decision, prompt, rawResponse } = await getAITradeDecision(ai, portfolio, pitches);
        const result = await executeTrade(supabase, ai, decision);
        
        await logTrade(supabase, ai, prompt, rawResponse, decision, result, 'manual');
        
        results.push({
          investor: ai.ai_nickname,
          decision,
          result
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error processing ${ai.ai_nickname}:`, error);
        results.push({
          investor: ai.ai_nickname,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results 
    });
  } catch (error) {
    console.error('AI trading trigger error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
