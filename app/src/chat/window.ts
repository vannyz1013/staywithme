// How much of the past goes up with each message.
//
// Not all of it. A long conversation would cost more every turn and read
// worse -- the durable parts are in memory (see app/src/memory), and this
// window is only for the thread of the current exchange.

import type { StoredMessage } from '../repo/types';
import type { WireMessage } from './types';

export const WINDOW_SIZE = 20;

export function windowFor(messages: StoredMessage[]): WireMessage[] {
  return messages
    .slice(-WINDOW_SIZE)
    .map((message) => ({ role: message.role, text: message.text }));
}
