import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const { data, error } = await supabase
    .from('investment_transactions')
    .select('*')
    .order('id', { ascending: false })
    .limit(10);
  
  return NextResponse.json({
    count: data?.length,
    error: error?.message,
    sample: data?.slice(0, 3)
  });
}
