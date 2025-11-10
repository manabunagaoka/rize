import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { userId, isActive, adminToken } = await request.json();
    
    // Verify admin token - must match exactly
    if (adminToken !== 'admin_secret_manaboodle_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Update is_active status
    const { error } = await supabase
      .from('user_token_balances')
      .update({ is_active: isActive })
      .eq('user_id', userId)
      .eq('is_ai_investor', true);  // Safety: only update AI investors

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: `AI investor ${isActive ? 'activated' : 'deactivated'}` 
    });
  } catch (error) {
    console.error('Toggle AI active error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
