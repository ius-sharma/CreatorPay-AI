'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; message?: string };

// Only a configured application origin can receive account email redirects.
function accountRedirect(recovery: boolean) {
  const url = new URL(process.env.NEXT_PUBLIC_APP_URL || '');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('Invalid application URL');
  return new URL(`/auth/callback${recovery ? '?flow=recovery' : ''}`, url.origin).href;
}

export async function requestAccountEmail(_previous: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') || '').trim();
  const mode = form.get('mode');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: 'Enter a valid email address.' };
  if (mode !== 'recover' && mode !== 'resend') return { error: 'Choose an account recovery option.' };
  let redirectTo: string;
  try { redirectTo = accountRedirect(mode === 'recover'); } catch { return { error: 'Account email setup is unavailable. Please contact the workspace operator.' }; }
  try {
    const auth = createClient().auth;
    // Supabase enforces email delivery and recovery rate limits. Provider responses
    // are intentionally indistinguishable to avoid exposing registered accounts.
    if (mode === 'recover') await auth.resetPasswordForEmail(email, { redirectTo });
    else await auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } });
  } catch { /* Keep account existence and provider diagnostics private. */ }
  return { message: 'If this address is eligible, an email will arrive shortly. Check spam and open the newest link in this browser. Delivery limits may apply; wait before retrying.' };
}

export async function updatePassword(_previous: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get('password') || '');
  if (password.length < 12 || password.length > 128) return { error: 'Use 12–128 characters for your new password.' };
  if (password !== String(form.get('confirmation') || '')) return { error: 'The two passwords do not match.' };
  try {
    const client = createClient();
    const { data: { user }, error: identityError } = await client.auth.getUser();
    if (identityError || !user) return { error: 'Your recovery session expired. Request a new password reset email.' };
    const { error } = await client.auth.updateUser({ password });
    if (error) return { error: 'Could not update the password. Choose a different password or request a new recovery link.' };
  } catch { return { error: 'Account service is unavailable. Please try again.' }; }
  return { message: 'Password updated. You can return to your account.' };
}

export async function authenticate(_previous: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  const mode = form.get('mode');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: 'Enter a valid email address.' };
  if (!password || password.length > 128) return { error: 'Enter your password (maximum 128 characters).' };
  if (mode !== 'login' && mode !== 'signup') return { error: 'Choose login or signup.' };
  if (mode === 'signup' && password.length < 12) return { error: 'Use a password with at least 12 characters.' };
  try {
    const supabase = createClient();
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: 'Could not create an account. Check your details and try again later.' };
      if (!data.session) return { message: 'Check your email to confirm your account, then return here to log in.' };
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: 'Login failed. Check your email, password and email confirmation.' };
    }
  } catch {
    return { error: 'Account service is unavailable. Please try again.' };
  }
  redirect(mode === 'login' && form.get('destination') === 'workspace' ? '/dashboard' : '/account');
}

export async function signOut(): Promise<AuthState> {
  try {
    const { error } = await createClient().auth.signOut({ scope: 'local' });
    if (error) return { error: 'Could not sign out. Please try again.' };
  } catch {
    return { error: 'Could not sign out. Please try again.' };
  }
  redirect('/login');
}
