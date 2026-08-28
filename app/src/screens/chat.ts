// The conversation itself.
//
// This screen owns the scroll position, the pending-reply bubble and the
// abort controller. Everything about *what* to send lives in
// app/src/chat/send-message.ts -- this file is the wiring.

import type { User } from '../auth/user';
import type { Character } from '../characters/types';
import { clearHistory, loadHistory } from '../chat/history';
import { sendMessage } from '../chat/send-message';
import { el } from '../core/el';
import type { Screen } from '../core/mount';
import { dayLabel } from '../core/time';
import type { StoredMessage } from '../repo/types';
import { bubble } from '../ui/bubble';
import { composer } from '../ui/composer';
import { chatHeader } from '../ui/header';
import { toast } from '../ui/toast';
import { typing } from '../ui/typing';

export interface ChatActions {
  onBack: () => void;
}

export function chatScreen(user: User, character: Character, actions: ChatActions): Screen {
  const thread = el('div', { class: 'thread' });
  const abort = new AbortController();

  let history: StoredMessage[] = [];
  let lastDay = '';

  function scrollToEnd(): void {
    thread.scrollTop = thread.scrollHeight;
  }

  /** Inserts a "Today" / "Yesterday" rule when the date changes. */
  function daySeparator(at: string): void {
    const label = dayLabel(at);
    if (label === lastDay) return;
    lastDay = label;
    thread.append(el('div', { class: 'day', text: label }));
  }

  function paint(message: StoredMessage): void {
    daySeparator(message.at);
    thread.append(bubble(message.role, message.text, message.at, character.hue).node);
  }

  async function send(text: string): Promise<void> {
    const now = new Date().toISOString();
    daySeparator(now);
    thread.append(bubble('user', text, now, character.hue).node);

    const dots = typing(character.hue);
    thread.append(dots);
    scrollToEnd();
    input.setBusy(true);

    // Created on the first streamed word, so the dots stay visible for the
    // whole of the wait rather than being replaced by an empty bubble.
    let reply: ReturnType<typeof bubble> | null = null;

    try {
      const result = await sendMessage({
        userId: user.id,
        displayName: user.name,
        characterId: character.id,
        text,
        history,
        signal: abort.signal,
        onChunk: (soFar) => {
          if (!reply) {
            dots.remove();
            reply = bubble('assistant', '', new Date().toISOString(), character.hue);
            thread.append(reply.node);
          }
          reply.setText(soFar);
          scrollToEnd();
        },
      });

      history = [...history, result.question, result.answer];
      if (!reply) {
        // The reply came back empty. Say so rather than leaving dots.
        dots.remove();
        toast(`${character.name} went quiet. Try that again?`);
      }
    } catch (error) {
      dots.remove();
      if (abort.signal.aborted) return;
      toast(error instanceof Error ? error.message : 'That message did not get through.');
    } finally {
      input.setBusy(false);
      scrollToEnd();
    }
  }

  const input = composer((text) => void send(text));

  const header = chatHeader(character, {
    onBack: actions.onBack,
    onClear: async () => {
      if (!confirm(`Forget everything you and ${character.name} have said? This cannot be undone.`)) return;
      await clearHistory(user.id, character.id);
      thread.replaceChildren();
      lastDay = '';
      history = await loadHistory(user.id, character.id);
      history.forEach(paint);
      scrollToEnd();
    },
  });

  const node = el('main', { class: 'screen screen-chat' }, [header, thread, input.node]);

  void loadHistory(user.id, character.id)
    .then((messages) => {
      history = messages;
      messages.forEach(paint);
      scrollToEnd();
      input.focus();
    })
    .catch(() => toast('Could not load the conversation.'));

  return { node, destroy: () => abort.abort() };
}
