// Correcting and deleting what a companion remembers.
//
// This exists because memory that cannot be corrected is surveillance. If
// they wrote down something wrong about you, or something you would rather
// they did not carry, you take it back out.

import { repo } from '../repo';

export function editMemory(
  userId: string,
  characterId: string,
  factId: string,
  text: string,
): Promise<void> {
  return repo.updateMemory(userId, characterId, factId, text.trim().slice(0, 200));
}

export function forgetMemory(userId: string, characterId: string, factId: string): Promise<void> {
  return repo.removeMemory(userId, characterId, factId);
}
