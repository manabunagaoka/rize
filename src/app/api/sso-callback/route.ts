import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const ssoToken = request.nextUrl.searchParams.get('sso_token');
  const ssoRefresh = request.nextUrl.searchParams.get('sso_refresh');
  
  console.log('[SSO CALLBACK API] ===== Processing SSO callback =====');
  console.log('[SSO CALLBACK API] Has token:', !!ssoToken);
  console.log('[SSO CALLBACK API] Has refresh:', !!ssoRefresh);
  console.log('[SSO CALLBACK API] All params:', Array.from(request.nextUrl.searchParams.entries()));
  
  if (!ssoToken) {
    console.log('[SSO CALLBACK API] ERROR: No SSO token provided');
    return NextResponse.json({ error: 'No SSO token provided' }, { status: 400 });
  }
  
  // Always redirect to home page after setting cookies
  const redirectPath = '/';
  
  console.log('[SSO CALLBACK API] Redirecting to:', redirectPath);
  
  // Create response with redirect
  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  
  // Set cookies
  response.cookies.set('manaboodle_sso_token', ssoToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  console.log('[SSO CALLBACK API] Token cookie set');
  
  if (ssoRefresh) {
    response.cookies.set('manaboodle_sso_refresh', ssoRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    console.log('[SSO CALLBACK API] Refresh cookie set');
  }
  
  console.log('[SSO CALLBACK API] ===== Callback complete, redirecting =====');
  
  return response;
}
