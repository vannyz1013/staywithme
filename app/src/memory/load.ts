// What this friend already knows about this person.

import { repo } from '../repo';

export function loadMemory(userId: string, characterId: string): Promise<string[]> {
  return repo.memory(userId, characterId);
}
