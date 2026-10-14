import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const recovery = request.nextUrl.searchParams.get('flow') === 'recovery';
  const code = request.nextUrl.searchParams.get('code');
  try {
    if (code) {
    const { error } = await createClient().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(recovery ? '/auth/reset-password' : '/account', request.url));
    }
  } catch {
    // Show a recoverable login error when the account service is unavailable.
  }
  return NextResponse.redirect(new URL(recovery ? '/login?mode=recover&error=confirmation' : '/login?error=confirmation', request.url));
}
