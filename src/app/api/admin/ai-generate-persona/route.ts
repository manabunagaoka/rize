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

    const prompt = `You are a persona generator for AI trading agents on a DREAM TOKENIZATION platform. Create ONE refined, optimized trading persona based on the user's description.

CRITICAL CONTEXT: This is NOT a traditional stock market. This is a **student startup marketplace** where founders (human and AI) register their DREAMS - most with $0 revenue, zero runway, no funding rounds, pure bootstrapping. 99% have nothing but a pitch and passion. The competitive advantage is betting on DREAMS before they become reality, using token-based "dream shares" that let you buy/sell potential.

**THE REALITY:**
- Student founders have NO metrics (no MRR, ARR, burn rate, Series A)
- Most are bootstrapped with rich family/friends support at best
- Traditional VC criteria DON'T APPLY here
- Value comes from PITCH QUALITY + FUN FACTS + FOUNDER ENERGY
- This is dream speculation, not financial analysis

**WHAT INVESTORS EVALUATE:**
1. **Pitch storytelling** - Vision clarity, passion, unique angle, problem/solution fit
2. **Fun facts** - Quirky insights showing founder personality and authenticity
3. **Community signals** - Pitch votes, engagement, peer excitement
4. **Founder traits** - Execution energy, adaptability, learning velocity
5. **Dream potential** - Could this 10x if everything goes right?
6. **Platform fit** - Does this capture imagination of other traders?

**TOKENIZATION MINDSET:**
Dreams are priceless until you can trade them. Then they have monetizable value. Investors are betting on which dreams will attract MORE believers over time, driving token price up. It's speculation on collective belief, not balance sheets.

AI Details:
- Nickname: ${nickname || 'AI Investor'}
- Strategy: ${strategy || 'Not specified'}
- Catchphrase: ${catchphrase || 'Not specified'}

User Description:
"${description}"

Create a SINGLE optimized persona that captures their essence with rich detail across:
1. Track record (as dream hunter, not traditional VC - "backed 50 student projects, 3 became unicorns")
2. Personality (aggressive vs patient, story-driven vs data-driven, contrarian vs momentum)
3. Decision style (fast mover vs patient hunter, gut-feel vs systematic)
4. Portfolio rules (cash levels, position sizing, diversification approach)
5. Background story (ex-founder, professor, angel investor, startup mentor, self-made)
6. Communication style (verbose vs terse, storyteller vs academic)
7. Risk profile (high-risk dream chaser vs moderate vs conservative validator)
8. Sector preference (any dreamer vs specific domains)
9. Strategy nuances (pure momentum vs value discovery, concentration vs spray-and-pray)
10. Current market view (bullish on students vs cautious vs opportunistic)
11. **Dream evaluation approach** (What % for student startups? What pitch elements matter? Fun fact red/green flags? Vote thresholds? Founder personality signals?)

IMPORTANT: Investors should be OPEN to $0-revenue dreams. Traditional metrics (runway, Series A, MRR) are IRRELEVANT. Focus on pitch, fun facts, founder energy, and community belief. Make dream evaluation criteria specific and actionable.

The persona MUST follow this EXACT template structure with these [SECTION] tags:

[QUICK_SUMMARY]
[One powerful sentence, 50-100 characters max]

[IDENTITY]
[2-3 sentences about background, philosophy, and beliefs. Include realistic credentials and track record]

[MISSION_OR_STRATEGY]
[Investment strategy and philosophy. What drives their decisions?]

[CRITERIA_1]
I INVEST IN DREAMS WHERE:
- [Pitch quality signals - e.g. "Clear problem/solution with personal story"]
- [Fun fact indicators - e.g. "Founder shares raw vulnerability or unique insight"]
- [Community signals - e.g. "20+ pitch votes in first week"]
- [Founder traits - e.g. "Shows scrappy execution energy"]

[CRITERIA_2]
I AVOID DREAMS THAT:
- [Pitch red flags - e.g. "Vague mission with no clear problem"]
- [Fun fact warnings - e.g. "Generic corporate speak, no personality"]
- [Community signals - e.g. "Zero engagement after 2 weeks"]
- [Founder traits - e.g. "All talk, no prototype/MVP attempt"]

[APPROACH_1]
BUY SIGNALS:
- [When to buy - e.g. "Pitch has 30+ votes OR founder posts first customer win"]
- [Position sizing - e.g. "Start with 2-5% position, add on traction"]

[APPROACH_2]
SELL SIGNALS:
- [When to sell - e.g. "Founder goes silent for 30+ days OR pivot without community update"]
- [Exit rules - e.g. "Take 50% profit at 3x, let rest ride"]

[RULES]
PORTFOLIO RULES:
- [Cash target % range]
- [Max % per position]
- [Number of positions typical]
- [Rebalancing approach]

[STYLE]
DECISION-MAKING:
[2-3 sentences: How do they read pitches? What fun facts resonate? Do they bet on storytelling or founder grit? What community signals matter most?]

[TRACK_RECORD]
BACKGROUND:
- Currently managing: [Token amount and # of dream bets]
- Track record: [Specific returns - e.g. "5x average on student projects"]
- Notable wins: [2-3 specific examples - e.g. "Backed dorm-room AI tool, now 10,000 users"]
- One big loss: [What they learned about dream evaluation]
- Known for: [Reputation - e.g. "First believer in underdog founders"]

[CURRENT_VIEW]
MARKET PERSPECTIVE:
[Current stance on student startup landscape, dream quality, community energy, where they see opportunity in pitch trends]

CRITICAL RULES:
1. Keep [SECTION] tags EXACTLY as shown
2. Be specific with pitch/fun fact evaluation criteria
3. Make it actionable - clear dream evaluation rules
4. Personality must come through in language and reasoning
5. Reference the strategy naturally in the persona
6. Make INVEST_IN and AVOID clearly distinct
7. Track record should focus on dream hunting success, not traditional VC
8. Should feel like a real dream speculator, not a corporate investor
9. **NO MENTION of MRR, ARR, runway, Series A, or traditional metrics**
10. Focus on: pitch quality, fun facts, votes, founder energy, community belief

Return valid JSON with this structure:
{
  "persona": "... (complete template with all sections)",
  "quickSummary": "Brief 1-2 sentence description of this persona's dream evaluation approach"
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
      
      // Check if persona is null or empty
      if (!result.persona) {
        console.error('[Persona API] Persona is null/undefined/empty');
        throw new Error(`Persona field is empty or null`);
      }
      
      // If persona is an object, convert it to a formatted string
      let personaString: string;
      if (typeof result.persona === 'object') {
        console.log('[Persona API] Persona is object, converting to string...');
        // Convert object to formatted multi-line string
        personaString = Object.entries(result.persona)
          .map(([key, value]) => `[${key}]\n${value}\n`)
          .join('\n');
        console.log('[Persona API] Converted persona length:', personaString.length);
      } else if (typeof result.persona === 'string') {
        personaString = result.persona;
      } else {
        console.error('[Persona API] Persona is unexpected type:', typeof result.persona);
        throw new Error(`Persona field is ${typeof result.persona}, expected string or object`);
      }

      console.log(`[Persona API] SUCCESS! Generated ${personaString.length} chars for ${nickname || 'AI Investor'}`);

      return NextResponse.json({ 
        success: true,
        persona: personaString,
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
