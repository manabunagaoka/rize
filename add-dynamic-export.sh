#!/bin/bash
# Add dynamic = 'force-dynamic' to all API routes to prevent pre-rendering

FILES=$(find src/app/api -name "route.ts" -type f)

for file in $FILES; do
  # Check if it already has the export
  if ! grep -q "export const dynamic" "$file"; then
    echo "Adding dynamic export to $file..."
    # Add after imports, before any other exports
    sed -i "/^import/,/^$/{ /^$/a\\
\\
// Force dynamic rendering - don't pre-render at build time\\
export const dynamic = 'force-dynamic';
    }" "$file"
  fi
done

echo "Done! Updated $(echo "$FILES" | wc -w) files"
