import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize Supabase client lazily (only when needed, not at module load)
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase environment variables are not set');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Initialize OpenAI client lazily (only when needed)
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// AI Investor personalities and strategies
const AI_PERSONALITIES = {
  'ai_boomer': {
    name: 'The Boomer',
    strategy: 'Conservative, diversified, proven traction, buy and hold',
    risk: 'low',
    maxInvestment: 100000,
    maxPositions: 5
  },
  'ai_steady': {
    name: 'Steady Eddie',
    strategy: 'Balanced portfolio, gradual growth, diversification',
    risk: 'medium-low',
    maxInvestment: 120000,
    maxPositions: 6
  },
  'ai_yolo': {
    name: 'YOLO Kid',
    strategy: 'High risk, concentrated bets, go big or go home',
    risk: 'very-high',
    maxInvestment: 300000,
    maxPositions: 2
  },
  'ai_diamond': {
    name: 'Diamond Hands',
    strategy: 'Buy dips, hold forever, never sell, diamond hands mentality',
    risk: 'medium',
    maxInvestment: 150000,
    maxPositions: 7
  },
  'ai_silicon': {
    name: 'Silicon Brain',
    strategy: 'Tech-only, AI/software focus, fundamental analysis',
    risk: 'medium-high',
    maxInvestment: 180000,
    maxPositions: 4
  },
  'ai_cloud': {
    name: 'Cloud Surfer',
    strategy: 'SaaS-only, subscription models, recurring revenue focus',
    risk: 'medium',
    maxInvestment: 140000,
    maxPositions: 5
  },
  'ai_fomo': {
    name: 'FOMO Master',
    strategy: 'Chase momentum, buy trending stocks, follow the crowd',
    risk: 'high',
    maxInvestment: 200000,
    maxPositions: 4
  },
  'ai_hype': {
    name: 'Hype Train',
    strategy: 'Follow buzz and volume, ride the wave, trend follower',
    risk: 'high',
    maxInvestment: 180000,
    maxPositions: 5
  },
  'ai_contrarian': {
    name: 'The Contrarian',
    strategy: 'Buy losers, sell winners, contrarian philosophy, fade the crowd',
    risk: 'medium-high',
    maxInvestment: 130000,
    maxPositions: 6
  },
  'ai_oracle': {
    name: 'The Oracle',
    strategy: 'Perfect timing, data-driven, analytical approach (best performance target)',
    risk: 'medium',
    maxInvestment: 200000,
    maxPositions: 7
  }
};

// Admin authentication (simple check - expand as needed)
function isAdmin(request: NextRequest): boolean {
  const adminToken = request.headers.get('X-Admin-Token');
  return adminToken === process.env.ADMIN_SECRET_TOKEN;
}

// POST - Trigger AI trading round for one or all AIs
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { aiUserId } = await request.json();

    // If specific AI provided, trade for that one. Otherwise, all AIs
    const aiIdsToTrade = aiUserId 
      ? [aiUserId] 
      : Object.keys(AI_PERSONALITIES);

    const results = [];

    for (const aiId of aiIdsToTrade) {
      const personality = AI_PERSONALITIES[aiId as keyof typeof AI_PERSONALITIES];
      if (!personality) continue;

      try {
        const tradeResult = await executeAITrade(aiId, personality);
        results.push({
          aiId,
          name: personality.name,
          success: true,
          ...tradeResult
        });
      } catch (error: any) {
        results.push({
          aiId,
          name: personality.name,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('AI trading error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function executeAITrade(aiUserId: string, personality: any) {
  const supabase = getSupabaseClient();
  
  // 1. Get AI's current portfolio
  const { data: balance } = await supabase
    .from('user_token_balances')
    .select('available_tokens')
    .eq('user_id', aiUserId)
    .single();

  const { data: holdings } = await supabase
    .from('user_investments')
    .select('pitch_id, shares_owned, current_value')
    .eq('user_id', aiUserId);

  // 2. Get available pitches to invest in
  const { data: pitches } = await supabase
    .from('student_projects')
    .select(`
      id,
      name,
      one_liner,
      elevator_pitch,
      category,
      traction_type,
      traction_value,
      vote_count
    `)
    .eq('status', 'approved')
    .limit(20);

  // 3. Get market data for pitches
  const { data: marketData } = await supabase
    .from('pitch_market_data')
    .select('pitch_id, current_price, total_supply, available_supply')
    .in('pitch_id', pitches?.map(p => p.id) || []);

  // 4. Build context for AI decision
  const portfolioContext = {
    cash: balance?.available_tokens || 0,
    holdings: holdings?.map(h => ({
      pitchId: h.pitch_id,
      shares: h.shares_owned,
      value: h.current_value
    })) || [],
    totalValue: (balance?.available_tokens || 0) + 
                (holdings?.reduce((sum, h) => sum + (h.current_value || 0), 0) || 0)
  };

  const marketContext = pitches?.map(pitch => {
    const market = marketData?.find(m => m.pitch_id === pitch.id);
    return {
      id: pitch.id,
      name: pitch.name,
      description: pitch.one_liner,
      pitch: pitch.elevator_pitch,
      category: pitch.category,
      traction: `${pitch.traction_type}: ${pitch.traction_value}`,
      votes: pitch.vote_count,
      price: market?.current_price || 100,
      available: market?.available_supply || 0
    };
  }) || [];

  // 5. Call OpenAI for trading decision
  const prompt = `You are "${personality.name}", an AI investor with this strategy: ${personality.strategy}

Your current portfolio:
- Cash: $${portfolioContext.cash.toLocaleString()}
- Current Holdings: ${portfolioContext.holdings.length} positions
- Total Portfolio Value: $${portfolioContext.totalValue.toLocaleString()}

Your constraints:
- Risk Level: ${personality.risk}
- Max Investment This Round: $${personality.maxInvestment.toLocaleString()}
- Max Total Positions: ${personality.maxPositions}

Available startup investments:
${JSON.stringify(marketContext, null, 2)}

Based on your strategy, decide which startup(s) to invest in (if any). Consider:
1. Your personality and risk tolerance
2. Current portfolio composition
3. Startup traction and category fit
4. Price and available shares
5. Diversification needs

Respond with JSON array of investments (empty array if no good opportunities):
[
  {
    "pitch_id": number,
    "shares": number (integer),
    "reasoning": "why this fits your strategy (2 sentences max)"
  }
]

Be strategic and stay in character. You can choose 0-3 investments.`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an AI investor making trading decisions. Respond ONLY with valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1000
  });

  const responseText = completion.choices[0].message.content || '[]';
  const decisions = JSON.parse(responseText);

  // 6. Execute trades
  const trades = [];
  for (const decision of decisions) {
    try {
      // Call existing invest API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': aiUserId, // Simulate as AI user
        },
        body: JSON.stringify({
          pitchId: decision.pitch_id,
          shares: decision.shares
        })
      });

      const result = await response.json();
      trades.push({
        pitch_id: decision.pitch_id,
        shares: decision.shares,
        reasoning: decision.reasoning,
        success: response.ok,
        result
      });
    } catch (error: any) {
      trades.push({
        pitch_id: decision.pitch_id,
        shares: decision.shares,
        reasoning: decision.reasoning,
        success: false,
        error: error.message
      });
    }
  }

  return {
    portfolio: portfolioContext,
    decisions,
    trades,
    aiResponse: responseText
  };
}
