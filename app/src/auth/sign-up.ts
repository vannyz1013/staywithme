// Creating an account.

import { supabase } from './client';
import { localSignUp } from './local-account';
import type { User } from './user';

export interface SignUpResult {
  user: User | null;
  /** Set when the project requires email confirmation before first sign-in. */
  needsConfirmation?: boolean;
  error?: string;
}

export async function signUp(name: string, email: string, password: string): Promise<SignUpResult> {
  const client = supabase();

  // No project configured: the email is ignored and the password becomes a
  // device PIN. See local-account.ts for what that does and does not mean.
  if (!client) return { user: localSignUp(name, password) };

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } },
  });

  if (error) return { user: null, error: error.message };
  if (!data.session) return { user: null, needsConfirmation: true };

  return { user: { id: data.user!.id, name, email } };
}
