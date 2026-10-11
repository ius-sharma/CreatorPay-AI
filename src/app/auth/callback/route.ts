import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  try {
    if (code) {
    const { error } = await createClient().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL('/account', request.url));
    }
  } catch {
    // Show a recoverable login error when the account service is unavailable.
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', request.url));
}
