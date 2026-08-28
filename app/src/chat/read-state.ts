// Asks the Worker how this conversation is going.
//
// Fired alongside the reply rather than before it, so the reading costs a
// call but never a wait. It lands in time to shape the *next* message and to
// update the panel at the top of the chat.

import { STATE_URL } from '../config/api-config';
import { parseState, type ConversationState } from '../friendship/state';
import type { WireMessage } from './types';

/** Returns null when the read failed or came back unreadable. */
export async function readState(messages: WireMessage[]): Promise<ConversationState | null> {
  try {
    const response = await fetch(STATE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Text only. Sending the photos again for a four-field reading would
      // double the cost of every picture.
      body: JSON.stringify({
        messages: messages.map(({ role, text }) => ({ role, text })),
      }),
    });
    if (!response.ok) return null;

    const { state } = (await response.json()) as { state: unknown };
    return state ? parseState(state) : null;
  } catch {
    return null;
  }
}
