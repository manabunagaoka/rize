import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Use the request's origin to build the redirect URL
  const redirectUrl = new URL('/', request.url);
  const response = NextResponse.redirect(redirectUrl);
  
  // Clear SSO cookies
  response.cookies.delete('manaboodle_sso_token');
  response.cookies.delete('manaboodle_sso_refresh');
  
  return response;
}
