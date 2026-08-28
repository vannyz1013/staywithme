// The conversation so far, and the opening line when there is none.

import type { Character } from '../characters/types';
import { id } from '../core/ids';
import { repo } from '../repo';
import type { StoredMessage } from '../repo/types';

/**
 * Loads the stored conversation. A first visit gets the companion's written
 * greeting -- stored like any other message, so it survives a reload and the
 * model can see what it already said.
 *
 * Takes the resolved Character rather than an id so that a companion who has
 * been renamed introduces themselves by the name you gave them.
 */
export async function loadHistory(
  userId: string,
  character: Character,
): Promise<StoredMessage[]> {
  const existing = await repo.messages(userId, character.id);
  if (existing.length > 0) return existing;

  const greeting: StoredMessage = {
    id: id(),
    role: 'assistant',
    text: character.greeting,
    at: new Date().toISOString(),
  };

  await repo.addMessage(userId, character.id, greeting);
  return [greeting];
}

export function clearHistory(userId: string, characterId: string): Promise<void> {
  return repo.clear(userId, characterId);
}
