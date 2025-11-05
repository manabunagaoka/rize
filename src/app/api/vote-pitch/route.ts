import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


// Verify user from Manaboodle SSO token
async function verifyUser(request: NextRequest) {
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  
  console.log('[VOTE API] ========== AUTH CHECK START ==========');
  console.log('[VOTE API] Checking auth:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 30)}...` : 'NO TOKEN',
    allCookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    headers: {
      authorization: request.headers.get('authorization'),
      cookie: request.headers.get('cookie') ? 'present' : 'missing'
    }
  });
  
  if (!token) {
    console.log('[VOTE API] ❌ No token found in cookies');
    return null;
  }

  try {
    console.log('[VOTE API] Calling Manaboodle SSO verify...');
    const response = await fetch('https://www.manaboodle.com/api/sso/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });

    console.log('[VOTE API] SSO verify response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VOTE API] ❌ SSO verification failed');
      console.error('[VOTE API] Error response body:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('[VOTE API] SSO response data structure:', {
      hasUser: !!data.user,
      hasDirectId: !!data.id,
      hasDirectEmail: !!data.email,
      keys: Object.keys(data),
      userKeys: data.user ? Object.keys(data.user) : null
    });
    
    const user = data.user || data;
    console.log('[VOTE API] ✅ Extracted user:', {
      id: user?.id,
      email: user?.email,
      name: user?.name
    });
    console.log('[VOTE API] ========== AUTH CHECK END ==========');
    
    return user;
  } catch (error) {
    console.error('[VOTE API] ❌ SSO verification exception:', error);
    console.error('[VOTE API] Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
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
  const supabase = getSupabaseServer();
  try {
    // Verify user directly from SSO token
    const user = await verifyUser(request);

    // Get all pitch vote counts
    const { data: rankings } = await supabase
      .from('legendary_pitch_rankings')
      .select('*');

    // Only include userVotes if authenticated
    if (user) {
      const { data: votes } = await supabase
        .from('legendary_pitch_votes')
        .select('pitch_id')
        .eq('user_id', user.id);

      const userVotes = votes?.map(v => v.pitch_id) || [];
      
      return NextResponse.json({
        rankings: rankings || [],
        userVotes
      });
    }

    // Not authenticated - return only rankings
    return NextResponse.json({
      rankings: rankings || []
    });

  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
