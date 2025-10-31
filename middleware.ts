// middleware.ts
// SSO Authentication middleware for Rize by Manaboodle
// Handles authentication via manaboodle.com SSO system

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log('🔥🔥🔥 MIDDLEWARE MODULE LOADED 🔥🔥🔥');

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
  '/debug-auth',    // Debug authentication page
  '/api/debug-auth', // Debug API endpoint
  '/competitions',  // Competitions page (public viewing)
  '/api/stock',     // Stock price API (public)
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('manaboodle_sso_token')?.value;
  const ssoToken = request.nextUrl.searchParams.get('sso_token');
  const fullUrl = request.url;
  
  console.log('[MIDDLEWARE] ========================================');
  console.log('[MIDDLEWARE] Request:', {
    pathname,
    fullUrl,
    hasToken: !!token,
    hasSsoTokenParam: !!ssoToken,
    ssoTokenPreview: ssoToken ? ssoToken.substring(0, 20) + '...' : 'none',
    allParams: Array.from(request.nextUrl.searchParams.entries()),
    cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    origin: request.nextUrl.origin,
    host: request.headers.get('host')
  });
  console.log('[MIDDLEWARE] ========================================');
  
  // Handle SSO callback FIRST (before checking public paths)
  // This is critical because /login is public but /login?sso_token=... needs processing
  if (ssoToken) {
    console.log('[MIDDLEWARE] ========== SSO CALLBACK DETECTED ==========');
    console.log('[MIDDLEWARE] SSO Token received:', ssoToken.substring(0, 30) + '...');
    
    // Try to get the intended destination from return_url or default to competitions page
    const returnUrl = request.nextUrl.searchParams.get('return_url');
    let redirectPath = '/competitions?competition=legendary';  // Default to competitions page after login
    
    if (returnUrl) {
      try {
        const returnUrlObj = new URL(returnUrl);
        // Only use return_url if it's not the root or login page
        if (returnUrlObj.pathname !== '/' && returnUrlObj.pathname !== '/login') {
          redirectPath = returnUrlObj.pathname + returnUrlObj.search;
          console.log('[MIDDLEWARE] Parsed return_url to:', redirectPath);
        } else {
          console.log('[MIDDLEWARE] Ignoring return_url (root/login), using default competitions page');
        }
      } catch (e) {
        // If return_url is invalid, use default
        console.log('[MIDDLEWARE] Invalid return_url, using default:', e);
      }
    }
    
    console.log('[MIDDLEWARE] Will redirect to:', redirectPath);
    console.log('[MIDDLEWARE] Setting cookies...');
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Store tokens in cookies with explicit path and domain
    response.cookies.set('manaboodle_sso_token', ssoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    console.log('[MIDDLEWARE] SSO token cookie set');
    
    const refreshToken = request.nextUrl.searchParams.get('sso_refresh');
    if (refreshToken) {
      response.cookies.set('manaboodle_sso_refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      console.log('[MIDDLEWARE] Refresh token cookie set');
    }
    
    console.log('[MIDDLEWARE] ========== SSO CALLBACK COMPLETE ==========');
    return response;
  }
  
  // Skip authentication for public paths
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))) {
    console.log('[MIDDLEWARE] Public path:', pathname);
    
    // For public paths, if token exists, verify it and inject user headers
    // This allows pages to show logged-in state without requiring auth
    if (token) {
      try {
        console.log('[MIDDLEWARE] Token exists on public path, verifying...');
        const verifyResponse = await fetch(`${MANABOODLE_BASE_URL}/api/sso/verify`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (verifyResponse.ok) {
          const responseData = await verifyResponse.json();
          console.log('[MIDDLEWARE] SSO response data:', JSON.stringify(responseData));
          
          // Handle both { user: {...} } and direct user object responses
          const user = responseData.user || responseData;
          
          if (user && user.id && user.email) {
            console.log('[MIDDLEWARE] Token verified on public path, user:', user.email);
            const response = NextResponse.next();
            
            response.headers.set('x-user-id', user.id);
            response.headers.set('x-user-email', user.email);
            response.headers.set('x-user-name', user.name || '');
            response.headers.set('x-user-class', user.classCode || '');
            
            return response;
          } else {
            console.log('[MIDDLEWARE] Invalid user data structure:', responseData);
          }
        } else {
          console.log('[MIDDLEWARE] Token invalid on public path, clearing cookies');
          // Invalid token, clear it
          const response = NextResponse.next();
          response.cookies.delete('manaboodle_sso_token');
          response.cookies.delete('manaboodle_sso_refresh');
          return response;
        }
      } catch (error) {
        console.error('[MIDDLEWARE] Error verifying token on public path:', error);
        // On error, just continue without user headers
        return NextResponse.next();
      }
    }
    
    // No token on public path, just continue
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
    const responseData = await verifyResponse.json();
    console.log('[MIDDLEWARE] SSO response data:', JSON.stringify(responseData));
    
    // Handle both { user: {...} } and direct user object responses
    const user = responseData.user || responseData;
    
    if (!user || !user.id || !user.email) {
      console.error('[MIDDLEWARE] Invalid user data structure:', responseData);
      const loginUrl = new URL(MANABOODLE_LOGIN_URL);
      const returnUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set('return_url', returnUrl);
      loginUrl.searchParams.set('app_name', APP_NAME);
      return NextResponse.redirect(loginUrl);
    }
    
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
