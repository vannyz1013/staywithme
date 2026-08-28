// The conversation so far, and the opening line when there is none.

import { getCharacter } from '../characters/get';
import { id } from '../core/ids';
import { repo } from '../repo';
import type { StoredMessage } from '../repo/types';

/**
 * Loads the stored conversation. A first visit gets the character's written
 * greeting -- stored like any other message, so it is there on reload and
 * the model sees what it already said.
 */
export async function loadHistory(userId: string, characterId: string): Promise<StoredMessage[]> {
  const existing = await repo.messages(userId, characterId);
  if (existing.length > 0) return existing;

  const character = getCharacter(characterId);
  if (!character) return [];

  const greeting: StoredMessage = {
    id: id(),
    role: 'assistant',
    text: character.greeting,
    at: new Date().toISOString(),
  };
  await repo.addMessage(userId, characterId, greeting);
  return [greeting];
}

export function clearHistory(userId: string, characterId: string): Promise<void> {
  return repo.clear(userId, characterId);
}
