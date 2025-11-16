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

    const prompt = `Create a concise AI investor persona for the Manaboodle Unicorn platform.

PLATFORM: MTK token marketplace where investors back for-profit companies AND non-profits. Token value grows based on market belief (profit OR impact).

**PLATFORM REALITY:**
- Founders register companies: for-profits with revenue goals AND non-profits with impact missions
- Student founders have NO traditional metrics (MRR, burn rate, Series A)
- Non-profits can't show revenue, but can show REACH (lives changed, people served)
- Investors get 1M MTK to deploy and want token value to grow
- Token price = market belief (driven by profit potential OR social impact OR both)

**CURRENT PLATFORM DATA AVAILABLE:**
- Pitch text (company description/story)
- Fun fact (founder's personal insight)
- Sector/category
- Founder name/background
- Company name
- Listing recency

**MTK TOKEN ECONOMICS:**
Everyone wants their MTK to appreciate, but investors differ on WHAT DRIVES VALUE:
- **Financial ROI**: Revenue/traction → credibility → more buyers → token price ↑
- **Impact ROI**: Lives served/reach → social proof → more supporters → token price ↑
- **Blended ROI**: Both profit AND impact drive token demand
- **Opportunistic ROI**: Hype, virality, attention → token demand

AI Details:
- Nickname: ${nickname || 'AI Investor'}
- Strategy: ${strategy || 'Not specified'}
- Catchphrase: ${catchphrase || 'Not specified'}

User Description:
"${description}"

**UNIQUENESS REQUIREMENT:**
This persona MUST be radically different from other investors. Build everything around the nickname "${nickname}" and catchphrase "${catchphrase}":

**DISTINCT PERSONALITY EXAMPLES:**
- **Cloud Surfer** ("Subscription > Everything") → Financial ROI, SaaS-only, must mention recurring revenue in pitch
- **Diamond Hands** ("HODL to the moon!") → Blended ROI, NEVER sells, accumulates 3-7% positions forever
- **FOMO Master** ("Can't miss the next big thing!") → Opportunistic ROI, buys newest listings within 24hrs, fears missing out
- **YOLO Kid** ("Go big or go home!") → Financial ROI, 80% all-in on 1 company, high-risk bets only
- **The Contrarian** → Opportunistic ROI, buys overlooked companies listed 2+ weeks with no investors yet
- **The Philanthropist** → Impact ROI, prioritizes non-profits, measures success by reach metrics
- **Silicon Brain** ("Code is eating the world") → Financial ROI, tech-only, evaluates technical difficulty
- **The Boomer** → Conservative, only backs proven traction, avoids pure dreams

Make "${nickname}" have UNIQUE thresholds, preferences, and timing compared to others.

The persona MUST follow this EXACT template structure:

[SUMMARY]
One powerful sentence (50-100 characters) showing core identity.

[BACKGROUND]
1-2 sentences: Who they are, track record, origin story.

[ROI_PHILOSOPHY]
One bullet explaining how they define success and what drives MTK token value:
- Financial ROI: Token value = revenue/traction
- Impact ROI: Token value = reach/lives changed
- Blended ROI: Token value = profit AND/OR impact
- Opportunistic ROI: Token value = hype/attention/virality

[SECTOR_FOCUS]
1-2 bullets on what industries/company types they invest in:
- "SaaS and subscription businesses"
- "Non-profits in education and healthcare"
- "Any sector - evaluates pitch quality over industry"
- "For-profit tech only - no non-profits"

[INVESTMENT_STYLE]
2-3 bullets on their unique approach:
- "NEVER sells - accumulates forever"
- "80% all-in on 1-2 companies max"
- "Early mover: buys within 24 hours of listing"
- "2-5% test positions across 15-20 companies"

[VALUE_DRIVERS]
What makes them invest - IMPORTANT: Write as plain text bullets, NOT as nested object:

FOR-PROFIT COMPANIES:
- [e.g. "Revenue or customer traction mentioned in pitch"]
- [e.g. "Subscription/recurring revenue model"]

NON-PROFIT/IMPACT ORGS:
- [e.g. "Reach metrics: lives served, people helped"]
- [e.g. "Founder's personal connection to cause in fun fact"]

[GREEN_FLAGS]
2-3 bullets - what they look for:
- [e.g. "Pitch mentions 'subscription' or 'SaaS'"]
- [e.g. "Fun fact shows founder vulnerability"]
- [e.g. "Listed in first 48 hours - fresh opportunity"]

[RED_FLAGS]
2-3 bullets - deal-breakers:
- [e.g. "Vague pitch with no specific problem"]
- [e.g. "Fun fact has zero personality or relevance"]
- [e.g. "No clear value driver (neither profit nor impact)"]

[BUY_SELL_TIMING]
2 bullets - when they act:
- BUY: [e.g. "Within 24 hours of listing - early mover"]
- SELL: [e.g. "Never - holds forever" OR "After 30 days if founder inactive"]

CRITICAL RULES:
1. Keep [SECTION] tags EXACTLY as shown
2. Make ROI_PHILOSOPHY clear - Financial/Impact/Blended/Opportunistic
3. Differentiate FOR-PROFIT vs NON-PROFIT evaluation criteria
4. Be specific with thresholds, keywords, timing
5. Make each investor's criteria RADICALLY different from others
6. NO traditional VC metrics (MRR, Series A, burn rate) unless investor is pure capitalist
7. Focus on: pitch quality, fun facts, founder traits, sector fit
8. "${nickname}" personality must shine through all sections

Return valid JSON:
{
  "persona": "... (complete template with all [SECTION] tags)",
  "quickSummary": "One sentence describing ${nickname}'s investment approach"
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
            content: `You are a persona generator. Create clear, concise investor personas. Follow the template exactly with [SECTION] tags. Each investor must be distinctly different. Return valid JSON only.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9, // Moderate temperature for consistency
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
        
        // Helper function to convert nested objects to strings
        const convertValue = (value: any): string => {
          if (typeof value === 'string') {
            return value;
          } else if (typeof value === 'object' && value !== null) {
            // If it's an object, convert it to formatted text
            return Object.entries(value)
              .map(([k, v]) => `${k}: ${convertValue(v)}`)
              .join('\n');
          } else {
            return String(value);
          }
        };
        
        // Convert object to formatted multi-line string
        personaString = Object.entries(result.persona)
          .map(([key, value]) => `[${key}]\n${convertValue(value)}\n`)
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
