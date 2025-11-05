import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client lazily (only when needed, not at module load)
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase environment variables are not set');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'competitions_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        try {
          await supabase.from('_migrations').select('*').limit(0); // Dummy query to test connection
          // Note: Supabase JS client doesn't support raw SQL execution
          // We need to use the REST API or Dashboard SQL Editor
          console.log('Statement:', statement.substring(0, 100) + '...');
        } catch (err) {
          console.error('Error executing statement:', err);
        }
      }
      
      return NextResponse.json({
        success: false,
        message: 'Cannot execute SQL through JS client. Please run the SQL file through Supabase Dashboard SQL Editor.',
        sqlPath: '/supabase/competitions_system.sql'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      data
    });
    
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
