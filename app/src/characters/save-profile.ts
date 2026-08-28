// Saving what you changed about a friend.
//
// Blank fields are dropped rather than stored as empty strings, so "clear the
// name" and "never set a name" end up as the same state -- one less way for
// the two to disagree.

import { repo } from '../repo';
import { NOTE_LIMIT, type FriendProfile } from './profile';

function tidy(value: string | undefined, limit: number): string | undefined {
  const trimmed = (value ?? '').trim();
  return trimmed ? trimmed.slice(0, limit) : undefined;
}

export function saveProfile(
  userId: string,
  characterId: string,
  profile: FriendProfile,
): Promise<void> {
  return repo.setProfile(userId, characterId, {
    name: tidy(profile.name, 40),
    gender: tidy(profile.gender, 40),
    age: tidy(profile.age, 40),
    note: tidy(profile.note, NOTE_LIMIT),
  });
}
