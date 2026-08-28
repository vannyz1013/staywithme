// What this companion knows about you.

import { repo } from '../repo';
import type { Fact } from '../repo/types';

export function loadMemory(userId: string, characterId: string): Promise<Fact[]> {
  return repo.memory(userId, characterId);
}
