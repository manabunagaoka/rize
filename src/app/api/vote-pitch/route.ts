import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pitchId } = body;

    // Get user info from headers (injected by middleware from Manaboodle SSO)
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');
    const classCode = request.headers.get('x-user-class');

    console.log('[VOTE API] Headers:', {
      userId,
      userEmail,
      userName,
      classCode,
      pitchId,
      allHeaders: Object.fromEntries(request.headers.entries())
    });

    if (!userId || !userEmail) {
      console.error('[VOTE API] Not authenticated - missing headers');
      return NextResponse.json(
        { error: 'Not authenticated', debug: { userId, userEmail, headers: Object.fromEntries(request.headers.entries()) } },
        { status: 401 }
      );
    }

    if (!pitchId || pitchId < 1 || pitchId > 10) {
      return NextResponse.json(
        { error: 'Invalid pitch ID' },
        { status: 400 }
      );
    }

    // Check if user already voted for this pitch
    const { data: existingVote } = await supabase
      .from('legendary_pitch_votes')
      .select('id')
      .eq('user_id', userId)
      .eq('pitch_id', pitchId)
      .single();

    if (existingVote) {
      // User already voted - remove their vote (toggle)
      await supabase
        .from('legendary_pitch_votes')
        .delete()
        .eq('user_id', userId)
        .eq('pitch_id', pitchId);

      return NextResponse.json({ 
        success: true, 
        action: 'unvoted',
        message: 'Vote removed' 
      });
    }

    // Insert new vote
    const { error } = await supabase
      .from('legendary_pitch_votes')
      .insert({
        pitch_id: pitchId,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        class_code: classCode || 'Unknown'
      });

    if (error) {
      console.error('Vote error:', error);
      return NextResponse.json(
        { error: 'Failed to save vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      action: 'voted',
      message: 'Vote recorded!' 
    });

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's votes and vote counts
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    // Get all pitch vote counts
    const { data: rankings } = await supabase
      .from('legendary_pitch_rankings')
      .select('*');

    // Get user's votes if authenticated
    let userVotes: number[] = [];
    if (userId) {
      const { data: votes } = await supabase
        .from('legendary_pitch_votes')
        .select('pitch_id')
        .eq('user_id', userId);

      userVotes = votes?.map(v => v.pitch_id) || [];
    }

    return NextResponse.json({
      rankings: rankings || [],
      userVotes
    });

  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
