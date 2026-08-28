// Adds newly learned facts. Memory is append-only: a friend who forgets on
// contradiction is worse than one who holds two versions and believes the
// newer one, which is what the system prompt tells them to do.

import { repo } from '../repo';

export function saveMemory(userId: string, characterId: string, facts: string[]): Promise<void> {
  return repo.addMemory(userId, characterId, facts);
}
