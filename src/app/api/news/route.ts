import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// GET - Fetch news posts
export async function GET(request: NextRequest) {
  try {
    // Get news ordered by most recent
    const { data: news, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('News fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch news' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      news: news || []
    });

  } catch (error) {
    console.error('News error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
