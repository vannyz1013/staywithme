// Signing in to an existing account.

import { supabase } from './client';
import { localSignIn } from './local-account';
import type { User } from './user';

export interface SignInResult {
  user: User | null;
  error?: string;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const client = supabase();

  if (!client) {
    const user = localSignIn(password);
    return user ? { user } : { user: null, error: 'That PIN does not match this device.' };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };

  const name = (data.user.user_metadata?.display_name as string | undefined) ?? email.split('@')[0]!;
  return { user: { id: data.user.id, name, email } };
}
