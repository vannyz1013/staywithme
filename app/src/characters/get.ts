import { CHARACTERS } from './list';
import type { Character } from './types';

export function getCharacter(id: string): Character | null {
  return CHARACTERS.find((character) => character.id === id) ?? null;
}
