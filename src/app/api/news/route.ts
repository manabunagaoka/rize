import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';


// GET - Fetch news posts
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
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
