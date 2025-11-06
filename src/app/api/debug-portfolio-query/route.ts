import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function verifyUser(request: NextRequest) {
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch('https://www.manaboodle.com/api/sso/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.user || data;
    
    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('SSO verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    }
  );

  const user = await verifyUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' });
  }

  // Run the EXACT same query as portfolio API
  const { data: withFilter, error: withFilterError } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', user.id)
    .gt('shares_owned', 0)
    .order('updated_at', { ascending: false });

  // Run without the gt filter
  const { data: withoutFilter, error: withoutFilterError } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Get just pitch_id 1
  const { data: metaOnly, error: metaError } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', user.id)
    .eq('pitch_id', 1)
    .maybeSingle();

  return NextResponse.json({
    userId: user.id,
    withGtFilter: {
      count: withFilter?.length || 0,
      pitchIds: withFilter?.map(inv => inv.pitch_id) || [],
      data: withFilter || [],
      error: withFilterError
    },
    withoutGtFilter: {
      count: withoutFilter?.length || 0,
      pitchIds: withoutFilter?.map(inv => inv.pitch_id) || [],
      data: withoutFilter || [],
      error: withoutFilterError
    },
    metaInvestment: {
      found: !!metaOnly,
      data: metaOnly,
      error: metaError
    }
  });
}
