// The companion speaking into a pause.
//
// Wraps the generic timer (app/src/chat/idle-nudge.ts) with the parts that
// need the open conversation: the context to send, and where to put the line
// if one comes back.

import { buildContext } from '../../chat/context';
import { idleNudge, type IdleNudge } from '../../chat/idle-nudge';
import { reachOut } from '../../chat/reach-out';
import { windowFor } from '../../chat/window';
import type { ChatSession } from './session';
import { speak } from './speak';

export function watchSilence(session: ChatSession): IdleNudge {
  return idleNudge({
    // Never over the top of a reply that is still arriving.
    ready: () => !session.busy,
    fire: async (quietMinutes) => {
      const context = await buildContext(
        session.user.id,
        session.character.id,
        session.user.name,
      );

      const text = await reachOut({
        context: { ...context, state: session.state },
        messages: windowFor(session.history),
        quietMinutes,
        reason: 'silence',
        signal: session.abort.signal,
      });

      if (text) await speak(session, text);
      return text;
    },
  });
}
