// Who is signed in right now, from whichever backend is in play.

import { supabase } from './client';
import { localUser } from './local-account';
import type { User } from './user';

export async function currentUser(): Promise<User | null> {
  const client = supabase();
  if (!client) return localUser();

  const { data } = await client.auth.getSession();
  const session = data.session;
  if (!session) return null;

  const email = session.user.email ?? undefined;
  const name =
    (session.user.user_metadata?.display_name as string | undefined) ??
    email?.split('@')[0] ??
    'friend';

  return { id: session.user.id, name, email };
}
