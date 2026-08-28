// Storage in this browser only. Used when no Supabase project is configured.
//
// Photos live in here too, as data URLs. localStorage is a few megabytes, so
// app/src/media/compress-image.ts shrinks anything before it arrives -- and
// core/storage.ts swallows the quota error if it still does not fit, which
// costs you the picture rather than the conversation.

import type { FriendProfile } from '../characters/profile';
import { isEmpty } from '../characters/profile';
import type { Moment } from '../friendship/moment';
import { id as newId } from '../core/ids';
import { read, remove, write } from '../core/storage';
import type { Fact, Repo, StoredMessage } from './types';

const messageKey = (userId: string, characterId: string) => `swm.msgs.${userId}.${characterId}`;
const memoryKey = (userId: string, characterId: string) => `swm.mem.${userId}.${characterId}`;
const traitKey = (userId: string, characterId: string) => `swm.traits.${userId}.${characterId}`;
const momentKey = (userId: string, characterId: string) => `swm.moments.${userId}.${characterId}`;
// One record for all five friends, because every screen that needs a profile
// needs all of them at once.
const profileKey = (userId: string) => `swm.friends.${userId}`;

function append<T>(key: string, value: T): void {
  write(key, [...read<T[]>(key, []), value]);
}

export const localRepo: Repo = {
  async messages(userId, characterId) {
    return read<StoredMessage[]>(messageKey(userId, characterId), []);
  },

  async addMessage(userId, characterId, message) {
    append(messageKey(userId, characterId), message);
  },

  async memory(userId, characterId) {
    return read<Fact[]>(memoryKey(userId, characterId), []);
  },

  async addMemory(userId, characterId, facts) {
    if (facts.length === 0) return;
    const key = memoryKey(userId, characterId);
    const fresh = facts.map((text) => ({ id: newId(), text }));
    write(key, [...read<Fact[]>(key, []), ...fresh]);
  },

  async updateMemory(userId, characterId, factId, text) {
    const key = memoryKey(userId, characterId);
    write(
      key,
      read<Fact[]>(key, []).map((fact) => (fact.id === factId ? { ...fact, text } : fact)),
    );
  },

  async removeMemory(userId, characterId, factId) {
    const key = memoryKey(userId, characterId);
    write(
      key,
      read<Fact[]>(key, []).filter((fact) => fact.id !== factId),
    );
  },

  async traits(userId, characterId) {
    return read<string[]>(traitKey(userId, characterId), []);
  },

  async addTrait(userId, characterId, trait) {
    append(traitKey(userId, characterId), trait);
  },

  async moments(userId, characterId) {
    return read<Moment[]>(momentKey(userId, characterId), []);
  },

  async addMoment(userId, characterId, moment) {
    append(momentKey(userId, characterId), moment);
  },

  async removeMoment(userId, characterId, momentId) {
    const key = momentKey(userId, characterId);
    write(
      key,
      read<Moment[]>(key, []).filter((moment) => moment.id !== momentId),
    );
  },

  async profiles(userId) {
    return read<Record<string, FriendProfile>>(profileKey(userId), {});
  },

  async setProfile(userId, characterId, profile) {
    const key = profileKey(userId);
    const all = read<Record<string, FriendProfile>>(key, {});
    if (isEmpty(profile)) delete all[characterId];
    else all[characterId] = profile;
    write(key, all);
  },

  async clear(userId, characterId) {
    remove(messageKey(userId, characterId));
    remove(memoryKey(userId, characterId));
    remove(traitKey(userId, characterId));
    remove(momentKey(userId, characterId));
  },
};
