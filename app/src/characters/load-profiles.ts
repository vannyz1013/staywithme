// Every friend this person has changed, in one read.

import { repo } from '../repo';
import type { FriendProfile } from './profile';

export function loadProfiles(userId: string): Promise<Record<string, FriendProfile>> {
  return repo.profiles(userId);
}

export async function loadProfile(userId: string, characterId: string): Promise<FriendProfile> {
  const profiles = await repo.profiles(userId);
  return profiles[characterId] ?? {};
}
