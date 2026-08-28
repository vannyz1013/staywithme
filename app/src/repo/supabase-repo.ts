// Storage in Supabase. Row-level security scopes every row to auth.uid(),
// so the user_id in each query is a filter for correctness, not a guard --
// see supabase/schema.sql.

import { supabase } from '../auth/client';
import type { FriendProfile } from '../characters/profile';
import { isEmpty } from '../characters/profile';
import type { Moment } from '../friendship/moment';
import type { Repo, StoredMessage } from './types';

function client() {
  const instance = supabase();
  if (!instance) throw new Error('Supabase is not configured.');
  return instance;
}

function boom(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

interface MessageRow {
  id: string;
  role: 'user' | 'assistant';
  body: string;
  images: string[] | null;
  created_at: string;
}

interface ProfileRow {
  character_id: string;
  name: string | null;
  gender: string | null;
  age: string | null;
  note: string | null;
}

export const supabaseRepo: Repo = {
  async messages(userId, characterId) {
    const { data, error } = await client()
      .from('messages')
      .select('id, role, body, images, created_at')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    boom(error);
    return (data ?? []).map((row: MessageRow) => ({
      id: row.id,
      role: row.role,
      text: row.body,
      at: row.created_at,
      images: row.images ?? undefined,
    }));
  },

  async addMessage(userId, characterId, message) {
    const { error } = await client().from('messages').insert({
      id: message.id,
      user_id: userId,
      character_id: characterId,
      role: message.role,
      body: message.text,
      images: message.images ?? null,
      created_at: message.at,
    });
    boom(error);
  },

  async memory(userId, characterId) {
    const { data, error } = await client()
      .from('memories')
      .select('id, fact')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    boom(error);
    return (data ?? []).map((row: { id: string; fact: string }) => ({
      id: row.id,
      text: row.fact,
    }));
  },

  async addMemory(userId, characterId, facts) {
    if (facts.length === 0) return;
    const { error } = await client()
      .from('memories')
      .insert(facts.map((fact) => ({ user_id: userId, character_id: characterId, fact })));
    boom(error);
  },

  async updateMemory(userId, characterId, factId, text) {
    const { error } = await client()
      .from('memories')
      .update({ fact: text })
      .match({ user_id: userId, character_id: characterId, id: factId });
    boom(error);
  },

  async removeMemory(userId, characterId, factId) {
    const { error } = await client()
      .from('memories')
      .delete()
      .match({ user_id: userId, character_id: characterId, id: factId });
    boom(error);
  },

  async traits(userId, characterId) {
    const { data, error } = await client()
      .from('traits')
      .select('trait')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    boom(error);
    return (data ?? []).map((row: { trait: string }) => row.trait);
  },

  async addTrait(userId, characterId, trait) {
    const { error } = await client()
      .from('traits')
      .insert({ user_id: userId, character_id: characterId, trait });
    boom(error);
  },

  async moments(userId, characterId) {
    const { data, error } = await client()
      .from('moments')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: true });

    boom(error);
    return (data ?? []).map((row: { id: string; title: string; created_at: string }) => ({
      id: row.id,
      title: row.title,
      at: row.created_at,
    }));
  },

  async addMoment(userId, characterId, moment) {
    const { error } = await client().from('moments').insert({
      id: moment.id,
      user_id: userId,
      character_id: characterId,
      title: moment.title,
      created_at: moment.at,
    });
    boom(error);
  },

  async removeMoment(userId, characterId, momentId) {
    const { error } = await client()
      .from('moments')
      .delete()
      .match({ user_id: userId, character_id: characterId, id: momentId });
    boom(error);
  },

  async profiles(userId) {
    const { data, error } = await client()
      .from('friend_profiles')
      .select('character_id, name, gender, age, note')
      .eq('user_id', userId);

    boom(error);

    const profiles: Record<string, FriendProfile> = {};
    for (const row of (data ?? []) as ProfileRow[]) {
      profiles[row.character_id] = {
        name: row.name ?? undefined,
        gender: row.gender ?? undefined,
        age: row.age ?? undefined,
        note: row.note ?? undefined,
      };
    }
    return profiles;
  },

  async setProfile(userId, characterId, profile) {
    const db = client();

    // Clearing every field means "give me back the friend as written", which
    // is a delete, not a row of nulls.
    if (isEmpty(profile)) {
      const { error } = await db
        .from('friend_profiles')
        .delete()
        .match({ user_id: userId, character_id: characterId });
      boom(error);
      return;
    }

    const { error } = await db.from('friend_profiles').upsert(
      {
        user_id: userId,
        character_id: characterId,
        name: profile.name ?? null,
        gender: profile.gender ?? null,
        age: profile.age ?? null,
        note: profile.note ?? null,
      },
      { onConflict: 'user_id,character_id' },
    );
    boom(error);
  },

  async clear(userId, characterId) {
    const db = client();
    const where = { user_id: userId, character_id: characterId };
    for (const table of ['messages', 'memories', 'traits', 'moments']) {
      const { error } = await db.from(table).delete().match(where);
      boom(error);
    }
  },
};
