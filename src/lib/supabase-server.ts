import { createClient } from '@supabase/supabase-js';

/**
 * Get a Supabase client for server-side use with service role key.
 * This function is lazy-loaded to avoid initialization at module load time,
 * which would fail during Next.js build when environment variables aren't available.
 */
export function getSupabaseServer() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase environment variables are not set');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}
