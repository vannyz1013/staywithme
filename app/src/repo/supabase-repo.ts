// Storage in Supabase. Row-level security scopes every row to auth.uid(),
// so the user_id below is a filter for correctness, not for access control
// -- see supabase/schema.sql.

import { supabase } from '../auth/client';
import type { Repo, StoredMessage } from './types';

function client() {
  const instance = supabase();
  if (!instance) throw new Error('Supabase is not configured.');
  return instance;
}

interface MessageRow {
  id: string;
  role: 'user' | 'assistant';
  body: string;
  created_at: string;
}

export const supabaseRepo: Repo = {
  async messages(userId, characterId) {
    const { data, error } = await client()
      .from('messages')
      .select('id, role, body, created_at')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row: MessageRow) => ({
      id: row.id,
      role: row.role,
      text: row.body,
      at: row.created_at,
    }));
  },

  async addMessage(userId, characterId, message) {
    const { error } = await client().from('messages').insert({
      id: message.id,
      user_id: userId,
      character_id: characterId,
      role: message.role,
      body: message.text,
      created_at: message.at,
    });
    if (error) throw new Error(error.message);
  },

  async memory(userId, characterId) {
    const { data, error } = await client()
      .from('memories')
      .select('fact')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row: { fact: string }) => row.fact);
  },

  async addMemory(userId, characterId, facts) {
    if (facts.length === 0) return;
    const { error } = await client()
      .from('memories')
      .insert(facts.map((fact) => ({ user_id: userId, character_id: characterId, fact })));
    if (error) throw new Error(error.message);
  },

  async clear(userId, characterId) {
    const db = client();
    const where = { user_id: userId, character_id: characterId };
    const messages = await db.from('messages').delete().match(where);
    if (messages.error) throw new Error(messages.error.message);
    const memories = await db.from('memories').delete().match(where);
    if (memories.error) throw new Error(memories.error.message);
  },
};
