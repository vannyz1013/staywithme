// Sending one message and showing the reply arrive.
//
// The dots, the streaming bubble, the failure toast and the busy flag. What
// the message is made of is app/src/chat/send-message.ts; this is what the
// screen does while that happens.

import { sendMessage } from '../../chat/send-message';
import { bubble } from '../../ui/bubble';
import { toast } from '../../ui/toast';
import { typing } from '../../ui/typing';
import type { ChatSession } from './session';

export function makeSend(session: ChatSession, onSettled: () => void) {
  return async function send(text: string, images: string[]): Promise<void> {
    const now = new Date().toISOString();
    session.view.paintRaw('user', text, now, images);

    const dots = typing(session.character.hue);
    session.view.node.append(dots);
    session.view.scrollToEnd();
    session.busy = true;
    session.input.setBusy(true);

    // Created on the first streamed word, so the dots stay up for the whole
    // wait instead of being replaced by an empty bubble.
    let reply: ReturnType<typeof bubble> | null = null;

    try {
      const result = await sendMessage({
        userId: session.user.id,
        displayName: session.user.name,
        characterId: session.character.id,
        text,
        images,
        history: session.history,
        state: session.state,
        signal: session.abort.signal,
        onState: (next) => {
          session.state = next;
          session.panel.update(next);
        },
        onChunk: (soFar) => {
          if (!reply) {
            dots.remove();
            reply = bubble({
              role: 'assistant',
              text: '',
              at: new Date().toISOString(),
              hue: session.character.hue,
            });
            session.view.node.append(reply.node);
          }
          reply.setText(soFar);
          session.view.scrollToEnd();
        },
      });

      session.history = [...session.history, result.question, result.answer];

      if (!reply) {
        // An empty reply is rare but it should not leave dots hanging there
        // forever pretending someone is typing.
        dots.remove();
        toast(`${session.character.name} went quiet. Try that again?`);
      }
    } catch (error) {
      dots.remove();
      if (session.abort.signal.aborted) return;
      toast(error instanceof Error ? error.message : 'That message did not get through.');
    } finally {
      session.busy = false;
      session.input.setBusy(false);
      session.view.scrollToEnd();
      onSettled();
    }
  };
}
