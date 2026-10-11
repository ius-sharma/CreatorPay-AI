import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cloud = process.env.CREATORPAY_BACKEND === 'supabase';
  const path = request.nextUrl.pathname;
  if (path === '/api/paypal/webhook' || (!cloud && (path.startsWith('/api/') || path === '/dashboard'))) return response;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return new NextResponse('Account setup is unavailable.', { status: 503 });
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Verify with the Auth service; never trust unverified session cookie contents.
  const { data: { user }, error } = await supabase.auth.getUser();
  if ((path === '/account' || (cloud && (path === '/dashboard' || path.startsWith('/api/')))) && (error || !user)) {
    const redirect = path.startsWith('/api/') ? NextResponse.json({ success: false, error: 'Log in to access your workspace.' }, { status: 401 }) : NextResponse.redirect(new URL('/login', request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    redirect.headers.set('Cache-Control', 'private, no-store');
    return redirect;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/login', '/account', '/auth/:path*', '/dashboard', '/api/:path*'] };
