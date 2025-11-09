import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, persona } = body;

    if (!userId || !persona) {
      return NextResponse.json({ error: 'Missing userId or persona' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Update the AI investor's persona
    const { error } = await supabase
      .from('user_token_balances')
      .update({ 
        ai_personality_prompt: persona,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_ai_investor', true);

    if (error) {
      console.error('Error updating persona:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Persona updated successfully'
    });
  } catch (error) {
    console.error('AI persona update error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
