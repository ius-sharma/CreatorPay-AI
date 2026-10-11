import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  try {
    if (token_hash && type === 'email') {
    const { error } = await createClient().auth.verifyOtp({ token_hash, type: 'email' });
    if (!error) return NextResponse.redirect(new URL('/account', request.url));
    }
  } catch {
    // Show a recoverable login error when the account service is unavailable.
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', request.url));
}
