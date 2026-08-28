// Decides when to think about what is worth remembering, and does it.
//
// Every few exchanges rather than every message: durable facts do not
// arrive one per turn, and running this each time would double the API
// calls to learn "they said hi".

import { REMEMBER_URL } from '../config/api-config';
import { read, write } from '../core/storage';
import type { StoredMessage } from '../repo/types';
import { loadMemory } from './load';
import { saveMemory } from './save';

/** Messages that must accumulate before a memory pass runs. */
const EVERY = 8;

const cursorKey = (userId: string, characterId: string) => `swm.memcursor.${userId}.${characterId}`;

/**
 * Runs a memory pass if enough has been said since the last one.
 * Fails quietly -- forgetting is not worth interrupting a conversation for.
 */
export async function refreshMemory(
  userId: string,
  characterId: string,
  messages: StoredMessage[],
): Promise<void> {
  const key = cursorKey(userId, characterId);
  const digested = read<number>(key, 0);
  if (messages.length - digested < EVERY) return;

  const fresh = messages.slice(digested);

  try {
    const memory = await loadMemory(userId, characterId);
    const response = await fetch(REMEMBER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        characterId,
        memory,
        messages: fresh.map((message) => ({ role: message.role, text: message.text })),
      }),
    });
    if (!response.ok) return;

    const { learned } = (await response.json()) as { learned: string[] };
    await saveMemory(userId, characterId, learned ?? []);

    // Only move the cursor on success, so a failed pass is retried with the
    // same messages next time rather than losing them.
    write(key, messages.length);
  } catch {
    // Offline, or the Worker is down. The conversation carries on.
  }
}
