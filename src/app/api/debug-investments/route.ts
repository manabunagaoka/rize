import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = getSupabaseServer();
  
  const { data: investments } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', '19be07bc-28d0-4ac6-956b-714eef1ccc85');
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    investments,
    filtered: investments?.filter(inv => inv.shares_owned > 0)
  });
}
