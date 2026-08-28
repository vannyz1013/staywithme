// Storage in this browser only. Used when no Supabase project is configured.

import { read, remove, write } from '../core/storage';
import type { Repo, StoredMessage } from './types';

const messageKey = (userId: string, characterId: string) => `swm.msgs.${userId}.${characterId}`;
const memoryKey = (userId: string, characterId: string) => `swm.mem.${userId}.${characterId}`;

export const localRepo: Repo = {
  async messages(userId, characterId) {
    return read<StoredMessage[]>(messageKey(userId, characterId), []);
  },

  async addMessage(userId, characterId, message) {
    const key = messageKey(userId, characterId);
    write(key, [...read<StoredMessage[]>(key, []), message]);
  },

  async memory(userId, characterId) {
    return read<string[]>(memoryKey(userId, characterId), []);
  },

  async addMemory(userId, characterId, facts) {
    if (facts.length === 0) return;
    const key = memoryKey(userId, characterId);
    write(key, [...read<string[]>(key, []), ...facts]);
  },

  async clear(userId, characterId) {
    remove(messageKey(userId, characterId));
    remove(memoryKey(userId, characterId));
  },
};
