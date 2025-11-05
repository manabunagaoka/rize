import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  // Use the request's origin to build the redirect URL
  const redirectUrl = new URL('/', request.url);
  const response = NextResponse.redirect(redirectUrl);
  
  // Clear SSO cookies
  response.cookies.delete('manaboodle_sso_token');
  response.cookies.delete('manaboodle_sso_refresh');
  
  return response;
}
