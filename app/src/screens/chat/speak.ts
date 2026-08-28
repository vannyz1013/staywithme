// The companion saying something that nobody asked for.
//
// Used by both unprompted paths -- the silence timer and the welcome back --
// so that an unprompted line is stored, shown and added to history in
// exactly one place.

import { id as newId } from '../../core/ids';
import { repo } from '../../repo';
import type { StoredMessage } from '../../repo/types';
import type { ChatSession } from './session';

export async function speak(session: ChatSession, text: string): Promise<void> {
  const message: StoredMessage = {
    id: newId(),
    role: 'assistant',
    text,
    at: new Date().toISOString(),
  };

  await repo.addMessage(session.user.id, session.character.id, message);
  session.history = [...session.history, message];
  session.view.paint(message);
  session.view.scrollToEnd();
}
