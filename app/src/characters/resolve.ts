// Applies what you changed to the friend as written.
//
// Everything downstream -- cards, avatars, the chat header, the dashboard --
// takes a plain Character, so doing the swap once here means none of them
// need to know profiles exist.

import type { FriendProfile } from './profile';
import type { Character } from './types';

export function resolve(character: Character, profile: FriendProfile | undefined): Character {
  const name = profile?.name?.trim();
  if (!name || name === character.name) return character;

  return {
    ...character,
    name,
    // The written greeting says their written name out loud ("I'm Mira").
    // Swapping it here means renaming before the first hello does not
    // produce a friend who introduces herself as someone else.
    greeting: character.greeting.split(character.name).join(name),
  };
}

export function resolveAll(
  characters: Character[],
  profiles: Record<string, FriendProfile>,
): Character[] {
  return characters.map((character) => resolve(character, profiles[character.id]));
}
