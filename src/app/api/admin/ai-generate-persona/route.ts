import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  console.log('[Persona API] Request received');
  
  try {
    const body = await request.json();
    const { description, currentData } = body;

    console.log('[Persona API] Parsed body:', { description: description?.substring(0, 100), currentData });

    if (!description) {
      console.error('[Persona API] No description provided');
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    }

    const { nickname, strategy, catchphrase } = currentData || {};
    
    console.log('[Persona API] Preparing OpenAI request for:', nickname || 'Unknown AI');

    const prompt = `You are a persona generator for AI trading agents. Create ONE refined, optimized trading persona based on the user's description.

AI Details:
- Nickname: ${nickname || 'AI Investor'}
- Strategy: ${strategy || 'Not specified'}
- Catchphrase: ${catchphrase || 'Not specified'}

User Description:
"${description}"

Create a SINGLE optimized persona that captures their essence with rich detail across:
1. Track record (hedge fund manager $500M vs ex-founder $50M vs family office $2B, etc.)
2. Personality (aggressive vs patient, data-driven vs intuitive, contrarian vs momentum)
3. Decision style (fast mover vs patient hunter, mechanical vs gut-feel)
4. Portfolio rules (cash levels, position sizing, diversification approach)
5. Background story (ex-tech PM, former CFO, CS grad, MBA, self-taught)
6. Communication style (verbose vs terse, storyteller vs academic)
7. Risk profile (high-risk vs moderate vs conservative)
8. Sector specialty (horizontal SaaS vs vertical vs dev tools vs all equally)
9. Strategy nuances (pure vs hybrid, growth vs profitability focus, concentration vs diversification)
10. Current market view (bullish vs cautious vs defensive vs opportunistic)

The persona MUST follow this EXACT template structure with these [SECTION] tags:

[QUICK_SUMMARY]
[One powerful sentence, 50-100 characters max]

[IDENTITY]
[2-3 sentences about background, philosophy, and beliefs. Include realistic credentials and track record]

[MISSION_OR_STRATEGY]
[Investment strategy and philosophy. What drives their decisions?]

[CRITERIA_1]
I INVEST IN:
- [Specific criterion with examples]
- [Specific criterion with examples]
- [Specific criterion with examples]

[CRITERIA_2]
I AVOID:
- [Specific anti-criterion with examples]
- [Specific anti-criterion with examples]
- [Specific anti-criterion with examples]

[APPROACH_1]
BUY SIGNALS:
- [When to buy - be specific with % or conditions]
- [Position sizing approach]

[APPROACH_2]
SELL SIGNALS:
- [When to sell - be specific]
- [Exit rules]

[RULES]
PORTFOLIO RULES:
- [Cash target % range]
- [Max % per position]
- [Number of positions typical]
- [Rebalancing approach]

[STYLE]
DECISION-MAKING:
[2-3 sentences: aggressive/patient? What matters most? How they analyze? Reference metrics they care about]

[TRACK_RECORD]
BACKGROUND:
- Currently managing: [Amount and type]
- Track record: [Specific returns with timeframe]
- Notable wins: [2-3 specific examples with returns]
- One big loss: [What they learned]
- Known for: [Reputation in market]

[CURRENT_VIEW]
MARKET PERSPECTIVE:
[Current stance on market conditions, valuations, opportunities. Should reflect their strategy and personality]

CRITICAL RULES:
1. Keep [SECTION] tags EXACTLY as shown
2. Be specific with numbers, percentages, and thresholds
3. Make it actionable - clear buy/sell rules
4. Personality must come through in language and reasoning
5. Reference the strategy naturally in the persona
6. Make INVEST_IN and AVOID clearly distinct
7. Track record must be realistic but impressive
8. Should feel like a real, unique investor personality

Return valid JSON with this structure:
{
  "persona": "... (complete template with all sections)",
  "quickSummary": "Brief 1-2 sentence description of this persona's core approach"
}`;

    try {
      console.log('[Persona API] Creating OpenAI client...');
      const openai = getOpenAIClient();
      
      console.log('[Persona API] Calling OpenAI API with gpt-4o-mini...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert persona generator for AI trading agents. Generate varied, realistic personas following the template structure exactly. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8, // Higher for more variation
        response_format: { type: 'json_object' }
      });

      console.log('[Persona API] OpenAI response received, parsing...');
      const rawResponse = completion.choices[0].message.content || '{}';
      console.log('[Persona API] Raw response (first 500 chars):', rawResponse.substring(0, 500));
      
      const result = JSON.parse(rawResponse);
      console.log('[Persona API] Parsed JSON keys:', Object.keys(result));
      console.log('[Persona API] Persona value type:', typeof result.persona);
      console.log('[Persona API] Persona value (first 200 chars):', 
        typeof result.persona === 'string' ? result.persona.substring(0, 200) : JSON.stringify(result.persona).substring(0, 200)
      );
      
      // Check if persona is null or empty
      if (!result.persona) {
        console.error('[Persona API] Persona is null/undefined/empty');
        throw new Error(`Persona field is empty or null`);
      }
      
      // Check if persona is not a string
      if (typeof result.persona !== 'string') {
        console.error('[Persona API] Persona is not a string, it is:', typeof result.persona);
        console.error('[Persona API] Persona value:', result.persona);
        throw new Error(`Persona field is ${typeof result.persona}, expected string`);
      }

      console.log(`[Persona API] SUCCESS! Generated ${result.persona.length} chars for ${nickname || 'AI Investor'}`);

      return NextResponse.json({ 
        success: true,
        persona: result.persona,
        quickSummary: result.quickSummary || 'AI-generated persona'
      });

    } catch (openaiError) {
      console.error('[Persona API] OpenAI error:', openaiError);
      console.error('[Persona API] Error stack:', openaiError instanceof Error ? openaiError.stack : 'No stack');
      return NextResponse.json({ 
        error: 'Failed to generate persona',
        details: openaiError instanceof Error ? openaiError.message : String(openaiError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Generate persona error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
