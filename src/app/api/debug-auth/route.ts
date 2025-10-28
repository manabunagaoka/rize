import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUser();
  const cookieStore = cookies();
  const headersList = headers();
  
  const allCookies = cookieStore.getAll();
  const ssoToken = cookieStore.get('manaboodle_sso_token');
  const ssoRefresh = cookieStore.get('manaboodle_sso_refresh');
  
  const userHeaders: Record<string, string> = {};
  const allHeadersObj: Record<string, string> = {};
  
  headersList.forEach((value, key) => {
    allHeadersObj[key] = value;
    if (key.startsWith('x-user-')) {
      userHeaders[key] = value;
    }
  });

  return NextResponse.json({
    user,
    cookies: {
      ssoToken: ssoToken ? {
        name: ssoToken.name,
        value: ssoToken.value.substring(0, 50)
      } : null,
      ssoRefresh: ssoRefresh ? {
        name: ssoRefresh.name,
        value: ssoRefresh.value.substring(0, 50)
      } : null,
      all: allCookies.map(c => ({
        name: c.name,
        value: c.value.substring(0, 30)
      }))
    },
    headers: {
      userHeaders,
      cookie: allHeadersObj['cookie'] || null
    }
  });
}
