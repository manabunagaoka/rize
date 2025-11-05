// app/api/health/route.ts
// Health check endpoint - tests database connectivity
// Public endpoint (no authentication required)

import { getSupabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Use service client to bypass RLS for health check
    const supabase = getSupabaseServer();
    
    // Test database connection by counting user balances
    const { count, error } = await supabase
      .from('user_token_balances')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      message: 'Database connection successful!',
      userCount: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({ 
      status: 'error',
      database: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
