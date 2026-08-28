// The countable part of a friendship, read straight off the message history
// rather than kept as a running total -- a counter that drifts out of step
// with the transcript is worse than no counter.

import type { StoredMessage } from '../repo/types';

/** A gap longer than this starts a new conversation rather than continuing one. */
const CONVERSATION_GAP_HOURS = 6;

export interface FriendshipStats {
  /** Whole days since the first message. Same-day counts as 0. */
  daysKnown: number;
  /** Separate sittings, not messages. */
  conversations: number;
  /** Only what you said -- their replies are not your effort. */
  messagesSent: number;
  /** Days since you last said anything. */
  daysQuiet: number;
}

const DAY = 86_400_000;

export function statsFor(messages: StoredMessage[]): FriendshipStats {
  const yours = messages.filter((message) => message.role === 'user');
  const first = messages[0];

  if (!first) {
    return { daysKnown: 0, conversations: 0, messagesSent: 0, daysQuiet: 0 };
  }

  const start = new Date(first.at).getTime();
  const last = new Date(messages[messages.length - 1]!.at).getTime();

  let conversations = 0;
  let previous = 0;
  for (const message of messages) {
    const at = new Date(message.at).getTime();
    if (at - previous > CONVERSATION_GAP_HOURS * 3_600_000) conversations += 1;
    previous = at;
  }

  return {
    daysKnown: Math.max(0, Math.floor((Date.now() - start) / DAY)),
    conversations,
    messagesSent: yours.length,
    daysQuiet: Math.max(0, Math.floor((Date.now() - last) / DAY)),
  };
}
