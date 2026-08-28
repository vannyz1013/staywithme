// The Supabase client, or null when no project is configured.
//
// Created once and shared: a second client on the same page would keep its
// own copy of the session and the two would drift.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isCloudConfigured } from '../config/supabase-config';

let cached: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (cached === undefined) {
    cached = isCloudConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  }
  return cached;
}
