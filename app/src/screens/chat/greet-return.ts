// Coming back after a while.
//
// The companion opens instead of waiting to be prompted -- and because it
// has the memory, what it opens with is usually the thing that was left
// hanging last time. This is the moment the app stops feeling like a text
// box and starts feeling like someone who was expecting you.

import { buildContext } from '../../chat/context';
import { reachOut } from '../../chat/reach-out';
import { windowFor } from '../../chat/window';
import type { ChatSession } from './session';
import { speak } from './speak';

/** Long enough away that coming back deserves more than silence. */
const RETURN_AFTER_HOURS = 20;

export async function greetReturn(session: ChatSession): Promise<void> {
  const last = session.history[session.history.length - 1];
  if (!last) return;

  const hoursAway = (Date.now() - new Date(last.at).getTime()) / 3_600_000;
  if (hoursAway < RETURN_AFTER_HOURS) return;

  const context = await buildContext(session.user.id, session.character.id, session.user.name);
  const text = await reachOut({
    context,
    messages: windowFor(session.history),
    quietMinutes: hoursAway * 60,
    reason: 'return',
    signal: session.abort.signal,
  });

  if (text) await speak(session, text);
}
