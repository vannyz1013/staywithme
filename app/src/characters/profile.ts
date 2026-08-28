// What you have changed about a friend.
//
// Every field is optional and every field overrides the written character
// (app/src/characters/list.ts + worker/prompt/persona.ts). Blank means "leave
// them as they are", which is why nothing here has a default value.

export interface FriendProfile {
  /** What you call them. Blank restores their written name. */
  name?: string;
  /** Free text on purpose -- "woman", "man", "neither", whatever fits. */
  gender?: string;
  /** Also free text: "24", "early 40s", "older than me". */
  age?: string;
  /** How you want them to be. The one that changes the most. */
  note?: string;
}

/** Longer than this is prompt, not preference. Enforced again on the Worker. */
export const NOTE_LIMIT = 600;

export function isEmpty(profile: FriendProfile): boolean {
  return !profile.name && !profile.gender && !profile.age && !profile.note;
}
