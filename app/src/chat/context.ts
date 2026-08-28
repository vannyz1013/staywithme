// Everything the Worker needs to know about this pair, gathered in one place.
//
// The chat route and the nudge route both want the same bundle, so it is
// assembled once rather than passed around in pieces.

import type { FriendProfile } from '../characters/profile';
import { loadProfile } from '../characters/load-profiles';
import type { ConversationState } from '../friendship/state';
import { currentLanguage } from '../i18n/current';
import type { LanguageId } from '../i18n/languages';
import { currentMode } from '../modes/current';
import type { ModeId } from '../modes/list';
import { repo } from '../repo';

export interface FriendContext {
  characterId: string;
  /** What this companion knows about them. Per companion, never shared. */
  memory: string[];
  /** How this companion has adapted to them. */
  traits: string[];
  profile: FriendProfile;
  mode: ModeId;
  language: LanguageId;
  displayName?: string;
  state?: ConversationState;
}

export async function buildContext(
  userId: string,
  characterId: string,
  displayName: string,
): Promise<FriendContext> {
  const [memory, traits, profile] = await Promise.all([
    repo.memory(userId, characterId),
    repo.traits(userId, characterId),
    loadProfile(userId, characterId),
  ]);

  return {
    characterId,
    memory: memory.map((fact) => fact.text),
    traits,
    profile,
    mode: currentMode(userId, characterId),
    language: currentLanguage(),
    displayName,
  };
}
