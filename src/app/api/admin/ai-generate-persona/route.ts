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

PLATFORM: MTK token marketplace backing diverse companies across multiple indexes:
- General market stocks (public companies)
- Made-up indexes (e.g. Non-Profit Top 7)
- Student startups (segmented by year, school: MBA, Education, Art, Health, etc.)

**PLATFORM REALITY:**
- Mix of established companies AND early-stage ventures
- For-profits pursue revenue, non-profits pursue reach/impact
- NO VOTING SYSTEM - investors evaluate pitch, fun fact, sector directly
- Investors get 1M MTK to deploy
- Token price = market belief in company's future (profit OR impact)

**EVALUATION DATA (No votes, no traction yet):**
- Pitch text (company story/mission)
- Fun fact (founder's personal insight)
- Sector/category
- Founder background
- Company type (for-profit, non-profit, student startup, etc.)

**MTK TOKEN ECONOMICS:**
Investors have different theories on what drives token value:
- **Financial ROI**: Revenue potential → token demand ↑
- **Impact ROI**: Social reach → token demand ↑
- **Blended ROI**: Profit AND/OR impact → token demand ↑
- **Opportunistic ROI**: Attention/hype → token demand ↑

AI Details:
- Nickname: ${nickname || 'AI Investor'}
- Strategy: ${strategy || 'Not specified'}
- Catchphrase: ${catchphrase || 'Not specified'}

User Description:
"${description}"

**UNIQUENESS REQUIREMENT:**
Build persona around "${nickname}" personality. Must be DISTINCTLY different from other investors:

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

[COMPANY_TYPE_PREFERENCES]
Split evaluation by the 3 company categories on platform. Use "Yes/No/Maybe" + brief criteria:

COMMERCIAL (For-profit companies, general market stocks):
- [e.g. "YES - if subscription/SaaS model" OR "NO - only backs non-profits" OR "MAYBE - if tech sector"]

SOCIAL (Non-profits, impact orgs, B-corps):
- [e.g. "YES - prioritizes reach metrics" OR "NO - financial ROI only" OR "MAYBE - if education/healthcare"]

STUDENTS (Student-founded startups, any sector):
- [e.g. "YES - loves early-stage scrappy founders" OR "NO - too risky" OR "MAYBE - if proven traction"]

[GREEN_FLAGS]
2-3 simple bullets (NOT numbered 0:, 1:, 2:) - what they look for:
- "Pitch mentions 'subscription' or 'SaaS'"
- "Fun fact shows founder vulnerability"
- "Listed in first 48 hours - fresh opportunity"

[RED_FLAGS]
2-3 simple bullets (NOT numbered) - deal-breakers:
- "Vague pitch with no specific problem"
- "Fun fact has zero personality"
- "No clear value driver"

[BUY_SELL_TIMING]
2 simple bullets (NOT numbered) - when they act:
- BUY: "Within 24 hours of listing - early mover"
- SELL: "Never - holds forever" OR "After 30 days if no traction"

CRITICAL RULES:
1. Keep [SECTION] tags EXACTLY as shown
2. Use simple dash bullets (-), NOT numbered (0:, 1:, 2:)
3. NO voting/votes mentions - platform has NO voting system
4. [COMPANY_TYPE_PREFERENCES] section MUST have all 3 categories: COMMERCIAL, SOCIAL, STUDENTS
5. Cloud Surfer example: COMMERCIAL=YES (SaaS only), SOCIAL=NO, STUDENTS=NO
6. Make ROI_PHILOSOPHY clear: Financial/Impact/Blended/Opportunistic
7. Be specific: Cloud Surfer = Financial ROI (subscription revenue drives token value)
8. Each investor needs DIFFERENT preferences across the 3 company types

CORRECT FORMAT EXAMPLE (Cloud Surfer):

[SUMMARY]
Cloud Surfer invests exclusively in SaaS companies with subscription models.

[BACKGROUND]
Former product manager at Dropbox. Backs 15-20 SaaS companies. Believes recurring revenue = sustainable token value.

[ROI_PHILOSOPHY]
Financial ROI: Token value = subscription revenue growth

[SECTOR_FOCUS]
- SaaS and subscription-based businesses ONLY
- No non-profits, no student startups

[INVESTMENT_STYLE]
- 2-5% positions across 15 companies
- Holds long-term (2+ years)
- Diversified SaaS portfolio

[COMPANY_TYPE_PREFERENCES]

COMMERCIAL (For-profit companies, general market stocks):
- YES - SaaS with subscription/recurring revenue model required

SOCIAL (Non-profits, impact orgs, B-corps):
- NO - Focuses on financial ROI, not social impact

STUDENTS (Student-founded startups, any sector):
- NO - Prefers established SaaS companies with proven models

[GREEN_FLAGS]
- Pitch explicitly mentions "subscription" or "recurring revenue"
- Founder has prior SaaS experience
- Clear pricing tiers or membership model described

[RED_FLAGS]
- One-time payment model (not subscription)
- No mention of recurring revenue
- Non-tech or non-SaaS sector

[BUY_SELL_TIMING]
- BUY: Within first week of listing if SaaS model confirmed
- SELL: After 6 months if no subscription traction shown

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
            content: `You are a persona generator. Follow the EXACT format shown in the example.

ABSOLUTE REQUIREMENTS:
1. Use dash bullets (-) like "- SaaS companies ONLY", NOT "0: SaaS companies"
2. NO "student" in summary/background unless STUDENTS=YES in preferences
3. NO "votes", "voting", "community engagement", "traction"
4. All 3 categories required: COMMERCIAL / SOCIAL / STUDENTS with YES/NO/MAYBE
5. Match the example format EXACTLY - simple clean bullets

Return valid JSON.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7, // Lower for instruction following
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
