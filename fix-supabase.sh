#!/bin/bash
# Fix all API routes to use lazy-loaded Supabase client

FILES=$(find src/app/api -name "route.ts" -type f | xargs grep -l "^const supabase = createClient")

for file in $FILES; do
  echo "Fixing $file..."
  
  # Replace the import
  sed -i "s/import { createClient } from '@supabase\/supabase-js';/import { getSupabaseServer } from '@\/lib\/supabase-server';/" "$file"
  
  # Remove the top-level supabase initialization
  sed -i "/^const supabase = createClient/,/^);$/d" "$file"
  
  # Add supabase initialization at the start of POST/GET functions
  sed -i '/^export async function POST(/a\  const supabase = getSupabaseServer();' "$file"
  sed -i '/^export async function GET(/a\  const supabase = getSupabaseServer();' "$file"
done

echo "Done! Fixed $(echo "$FILES" | wc -w) files"
