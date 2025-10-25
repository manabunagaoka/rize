// app/api/health/route.ts
// Health check endpoint - tests database connectivity
// Public endpoint (no authentication required)

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection by counting top startups
    const { count, error } = await supabase
      .from('top_startups')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      message: 'Database connection successful!',
      startupCount: count || 0,
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
