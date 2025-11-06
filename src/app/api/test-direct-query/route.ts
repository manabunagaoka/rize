import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Create brand new client
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Query directly
  const { data, error } = await client
    .from('user_investments')
    .select('pitch_id, shares_owned, user_id')
    .eq('user_id', '19be07bc-28d0-4ac6-956b-714eef1ccc85');
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalRows: data?.length,
    allRows: data,
    filteredGtZero: data?.filter(r => r.shares_owned > 0),
    error
  }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
