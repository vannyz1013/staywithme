// Decides when to think about what is worth keeping, and stores the three
// things that come back: facts about you, a name for what happened, and how
// the friend changed.
//
// Every few exchanges rather than every message -- durable things do not
// arrive one per turn, and running this each time would double the API calls
// to learn "they said hi".

import { REMEMBER_URL } from '../config/api-config';
import { id } from '../core/ids';
import { read, write } from '../core/storage';
import { repo } from '../repo';
import type { StoredMessage } from '../repo/types';
import { loadMemory } from './load';
import { saveMemory } from './save';

/** Messages that must accumulate before a memory pass runs. */
const EVERY = 8;

const cursorKey = (userId: string, characterId: string) => `swm.memcursor.${userId}.${characterId}`;

interface Learned {
  learned?: string[];
  moment?: string | null;
  trait?: string | null;
}

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
        memory: memory.map((fact) => fact.text),
        // Text only: the pass is about what was said, and re-uploading the
        // photos would make remembering the most expensive call in the app.
        messages: fresh.map((message) => ({ role: message.role, text: message.text })),
      }),
    });
    if (!response.ok) return;

    const { learned, moment, trait } = (await response.json()) as Learned;

    await saveMemory(userId, characterId, learned ?? []);
    if (trait) await repo.addTrait(userId, characterId, trait);
    if (moment) {
      await repo.addMoment(userId, characterId, {
        id: id(),
        title: moment,
        // Dated to the conversation it came from, not to when the pass ran.
        at: fresh[fresh.length - 1]?.at ?? new Date().toISOString(),
      });
    }

    // Only move the cursor on success, so a failed pass is retried with the
    // same messages next time rather than losing them.
    write(key, messages.length);
  } catch {
    // Offline, or the Worker is down. The conversation carries on.
  }
}
