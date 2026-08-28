// Signing out. Conversations are not deleted -- they are waiting on the
// next sign-in, which is the entire point of storing them.

import { supabase } from './client';
import { localSignOut } from './local-account';

export async function signOut(): Promise<void> {
  const client = supabase();
  if (client) await client.auth.signOut();
  else localSignOut();
}
