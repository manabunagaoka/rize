// middleware.ts
// SSO Authentication middleware for Rize by Manaboodle
// Handles authentication via manaboodle.com SSO system

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// CONFIGURATION
// ============================================
const MANABOODLE_BASE_URL = 'https://www.manaboodle.com';
const MANABOODLE_LOGIN_URL = 'https://www.manaboodle.com/academic-portal/login';
const APP_NAME = 'RIZE';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',              // Landing page with Top 10 startups
  '/leaderboard',   // Public leaderboard
  '/api/health',    // Health check endpoint
  '/login',         // RIZE login page
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  const ssoToken = request.nextUrl.searchParams.get('sso_token');
  
  console.log('[MIDDLEWARE]', {
    pathname,
    hasToken: !!token,
    hasSsoTokenParam: !!ssoToken,
    url: request.url,
    cookies: request.cookies.getAll().map(c => c.name)
  });
  
  // Handle SSO callback FIRST (before checking public paths)
  // This is critical because /login is public but /login?sso_token=... needs processing
  if (ssoToken) {
    console.log('[MIDDLEWARE] SSO callback detected');
    
    // Try to get the intended destination from return_url or default to /competitions
    const returnUrl = request.nextUrl.searchParams.get('return_url');
    let redirectPath = '/competitions?competition=legendary';
    
    if (returnUrl) {
      try {
        const returnUrlObj = new URL(returnUrl);
        redirectPath = returnUrlObj.pathname + returnUrlObj.search;
      } catch {
        // If return_url is invalid, use default
      }
    }
    
    console.log('[MIDDLEWARE] Redirecting to:', redirectPath);
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Store tokens in cookies
    response.cookies.set('manaboodle_sso_token', ssoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    const refreshToken = request.nextUrl.searchParams.get('sso_refresh');
    if (refreshToken) {
      response.cookies.set('manaboodle_sso_refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return response;
  }
  
  // Skip authentication for public paths
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))) {
    console.log('[MIDDLEWARE] Public path, skipping auth:', pathname);
    return NextResponse.next();
  }
  
  // No token? Redirect to Manaboodle Academic Portal login
  if (!token) {
    console.log('[MIDDLEWARE] No token, redirecting to Academic Portal');
    const loginUrl = new URL(MANABOODLE_LOGIN_URL);
    const returnUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('return_url', returnUrl);
    loginUrl.searchParams.set('app_name', APP_NAME);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token with Manaboodle
  try {
    console.log('[MIDDLEWARE] Verifying token with Manaboodle');
    const verifyResponse = await fetch(`${MANABOODLE_BASE_URL}/api/sso/verify`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!verifyResponse.ok) {
      console.log('[MIDDLEWARE] Token verification failed, clearing cookies');
      // Token invalid, clear cookies and redirect to Academic Portal login
      const loginUrl = new URL(MANABOODLE_LOGIN_URL);
      const returnUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set('return_url', returnUrl);
      loginUrl.searchParams.set('app_name', APP_NAME);
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('manaboodle_sso_token');
      response.cookies.delete('manaboodle_sso_refresh');
      return response;
    }
    
    // Token valid, attach user info to headers (accessible in your pages/API routes)
    const { user } = await verifyResponse.json();
    console.log('[MIDDLEWARE] Token verified, user:', user.email);
    const response = NextResponse.next();
    
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-name', user.name || '');
    response.headers.set('x-user-class', user.classCode || '');
    
    return response;
    
  } catch (error) {
    console.error('SSO verification error:', error);
    
    // On error, redirect to Academic Portal login
    const loginUrl = new URL(MANABOODLE_LOGIN_URL);
    const returnUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('return_url', returnUrl);
    loginUrl.searchParams.set('app_name', APP_NAME);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
