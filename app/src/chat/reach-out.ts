// Asks the friend whether they want to say something unprompted.
//
// The Worker is allowed to answer "no" -- most silences do not need filling
// -- and it says so by returning a null text, which is why this returns
// `string | null` rather than always producing a message.

import { NUDGE_URL } from '../config/api-config';
import type { FriendContext } from './context';
import type { WireMessage } from './types';

export interface ReachOutOptions {
  context: FriendContext;
  messages: WireMessage[];
  quietMinutes: number;
  reason: 'silence' | 'return';
  signal?: AbortSignal;
}

export async function reachOut(options: ReachOutOptions): Promise<string | null> {
  try {
    const response = await fetch(NUDGE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: options.signal,
      body: JSON.stringify({
        ...options.context,
        messages: options.messages,
        quietMinutes: options.quietMinutes,
        reason: options.reason,
      }),
    });
    if (!response.ok) return null;

    const { text } = (await response.json()) as { text: string | null };
    return text;
  } catch {
    // A friend who fails to think of something to say just says nothing.
    return null;
  }
}
