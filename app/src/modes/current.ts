// Which mode this conversation is in.
//
// Kept per person per companion and on the device rather than in the
// database: it is a property of right now, not of the relationship, and it
// should not follow you to another device three days later.

import { read, write } from '../core/storage';
import { DEFAULT_MODE, type ModeId } from './list';

const key = (userId: string, characterId: string) => `swm.mode.${userId}.${characterId}`;

export function currentMode(userId: string, characterId: string): ModeId {
  return read<ModeId>(key(userId, characterId), DEFAULT_MODE);
}

export function setMode(userId: string, characterId: string, mode: ModeId): void {
  write(key(userId, characterId), mode);
}
