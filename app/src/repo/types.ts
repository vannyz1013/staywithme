// The storage contract. Two implementations satisfy it -- Supabase when a
// project is configured, localStorage when one is not -- and nothing above
// this layer knows which one it got.

import type { FriendProfile } from '../characters/profile';
import type { Moment } from '../friendship/moment';

/** One remembered thing. Carries an id so it can be edited and deleted. */
export interface Fact {
  id: string;
  text: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** ISO timestamp. */
  at: string;
  /** Photos and video frames sent with this message, as data URLs. */
  images?: string[];
}

export interface Repo {
  messages(userId: string, characterId: string): Promise<StoredMessage[]>;
  addMessage(userId: string, characterId: string, message: StoredMessage): Promise<void>;

  /** What this friend knows about you. Yours to read, correct and delete. */
  memory(userId: string, characterId: string): Promise<Fact[]>;
  addMemory(userId: string, characterId: string, facts: string[]): Promise<void>;
  updateMemory(userId: string, characterId: string, factId: string, text: string): Promise<void>;
  removeMemory(userId: string, characterId: string, factId: string): Promise<void>;

  /** How this friend has changed by knowing you -- character evolution. */
  traits(userId: string, characterId: string): Promise<string[]>;
  addTrait(userId: string, characterId: string, trait: string): Promise<void>;

  /** The named moments you two have, oldest first -- the scrapbook. */
  moments(userId: string, characterId: string): Promise<Moment[]>;
  addMoment(userId: string, characterId: string, moment: Moment): Promise<void>;
  removeMoment(userId: string, characterId: string, momentId: string): Promise<void>;

  /**
   * Every friend this person has changed, by character id. Fetched as one
   * map because the choosing screen needs all five at once.
   */
  profiles(userId: string): Promise<Record<string, FriendProfile>>;
  /** An all-blank profile clears the changes and restores the written one. */
  setProfile(userId: string, characterId: string, profile: FriendProfile): Promise<void>;

  /** Forgets the conversation. Leaves the profile: that is who you made them. */
  clear(userId: string, characterId: string): Promise<void>;
}
