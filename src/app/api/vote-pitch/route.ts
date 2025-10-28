import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Verify user from Manaboodle SSO token
async function verifyUser(request: NextRequest) {
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch('https://www.manaboodle.com/sso/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('[VOTE API] SSO verification failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pitchId } = body;

    // Verify user directly from SSO token
    const user = await verifyUser(request);

    console.log('[VOTE API] User verification:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      pitchId
    });

    if (!user) {
      console.error('[VOTE API] Not authenticated');
      return NextResponse.json(
        { error: 'Not authenticated. Please log in.' },
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
      .eq('user_id', user.id)
      .eq('pitch_id', pitchId)
      .single();

    if (existingVote) {
      // User already voted - remove their vote (toggle)
      await supabase
        .from('legendary_pitch_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('pitch_id', pitchId);

      // Get updated rankings and user votes
      const { data: rankings } = await supabase
        .from('legendary_pitch_rankings')
        .select('*');

      const { data: votes } = await supabase
        .from('legendary_pitch_votes')
        .select('pitch_id')
        .eq('user_id', user.id);

      const userVotes = votes?.map(v => v.pitch_id) || [];

      return NextResponse.json({ 
        success: true, 
        action: 'unvoted',
        message: 'Vote removed',
        rankings: rankings || [],
        userVotes
      });
    }

    // Insert new vote
    const { error } = await supabase
      .from('legendary_pitch_votes')
      .insert({
        pitch_id: pitchId,
        user_id: user.id,
        user_email: user.email,
        user_name: user.name || user.email,
        class_code: user.classCode || 'Unknown'
      });

    if (error) {
      console.error('Vote error:', error);
      return NextResponse.json(
        { error: 'Failed to save vote' },
        { status: 500 }
      );
    }

    // Get updated rankings and user votes
    const { data: rankings } = await supabase
      .from('legendary_pitch_rankings')
      .select('*');

    const { data: votes } = await supabase
      .from('legendary_pitch_votes')
      .select('pitch_id')
      .eq('user_id', user.id);

    const userVotes = votes?.map(v => v.pitch_id) || [];

    return NextResponse.json({ 
      success: true, 
      action: 'voted',
      message: 'Vote recorded!',
      rankings: rankings || [],
      userVotes
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
    // Verify user directly from SSO token
    const user = await verifyUser(request);

    // Get all pitch vote counts
    const { data: rankings } = await supabase
      .from('legendary_pitch_rankings')
      .select('*');

    // Get user's votes if authenticated
    let userVotes: number[] = [];
    if (user) {
      const { data: votes } = await supabase
        .from('legendary_pitch_votes')
        .select('pitch_id')
        .eq('user_id', user.id);

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
