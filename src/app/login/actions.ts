'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; message?: string };

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
  redirect('/account');
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
