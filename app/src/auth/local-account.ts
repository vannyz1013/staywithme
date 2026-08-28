// The fallback account, used only when no Supabase project is configured.
//
// This is NOT security. The PIN is stored in plain text in this browser and
// anyone with the device can read it; it exists so the app has a name to
// greet you by and a key to file conversations under before you set up a
// real project. Everything it stores stays on this one device.

import { id } from '../core/ids';
import { read, remove, write } from '../core/storage';
import type { User } from './user';

const ACCOUNT_KEY = 'swm.local.account';
const SESSION_KEY = 'swm.local.session';

interface LocalAccount extends User {
  pin: string;
}

export function localSignUp(name: string, pin: string): User {
  const account: LocalAccount = { id: id(), name, pin };
  write(ACCOUNT_KEY, account);
  write(SESSION_KEY, true);
  return { id: account.id, name: account.name };
}

export function localSignIn(pin: string): User | null {
  const account = read<LocalAccount | null>(ACCOUNT_KEY, null);
  if (!account || account.pin !== pin) return null;
  write(SESSION_KEY, true);
  return { id: account.id, name: account.name };
}

export function localSignOut(): void {
  remove(SESSION_KEY);
}

export function localUser(): User | null {
  const account = read<LocalAccount | null>(ACCOUNT_KEY, null);
  if (!account || !read<boolean>(SESSION_KEY, false)) return null;
  return { id: account.id, name: account.name };
}

/** True once someone has created the local account on this device. */
export function hasLocalAccount(): boolean {
  return read<LocalAccount | null>(ACCOUNT_KEY, null) !== null;
}
