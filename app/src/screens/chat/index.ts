// The conversation screen, assembled.
//
// Everything here is wiring: the pieces are in the files beside this one.

import type { User } from '../../auth/user';
import type { Character } from '../../characters/types';
import { loadHistory } from '../../chat/history';
import { el } from '../../core/el';
import type { Screen } from '../../core/mount';
import { t } from '../../i18n/current';
import { currentMode } from '../../modes/current';
import { composer } from '../../ui/composer';
import { chatHeader } from '../../ui/header';
import { statePanel } from '../../ui/state-panel';
import { toast } from '../../ui/toast';
import { greetReturn } from './greet-return';
import { helpButton } from './help-button';
import { modeControl } from './mode-control';
import { makeSend } from './send-flow';
import type { ChatSession } from './session';
import { watchSilence } from './silence';
import { threadView } from './thread-view';

export interface ChatActions {
  onBack: () => void;
  onOpenAbout: () => void;
}

export function chatScreen(user: User, character: Character, actions: ChatActions): Screen {
  const strings = t();

  const session: ChatSession = {
    user,
    character,
    abort: new AbortController(),
    history: [],
    mode: currentMode(user.id, character.id),
    busy: false,
    view: threadView(character.hue),
    // Filled in immediately below -- the composer needs `send`, and `send`
    // needs the session, so one of the two has to be assigned late.
    input: null as unknown as ChatSession['input'],
    panel: statePanel(character.hue),
  };

  const silence = watchSilence(session);
  const send = makeSend(session, () => silence.restart());

  session.input = composer({
    onSend: (text, images) => void send(text, images),
    onVideoAttached: () => toast(strings.videoFrames),
  });

  const bar = modeControl(session, () => silence.restart());

  // Annotated because `node` is referenced inside helpButton's callback,
  // which TypeScript cannot infer through without help.
  const node: HTMLElement = el('main', { class: 'screen screen-chat' }, [
    chatHeader(character, actions),
    session.panel.node,
    session.view.node,
    helpButton(() => node),
    bar.node,
    session.input.node,
  ]);

  void loadHistory(user.id, character)
    .then(async (messages) => {
      session.history = messages;
      messages.forEach((message) => session.view.paint(message));
      session.view.scrollToEnd();
      session.input.focus();

      await greetReturn(session);
      silence.restart();
    })
    .catch(() => toast('Could not load the conversation.'));

  return {
    node,
    destroy: () => {
      silence.stop();
      session.abort.abort();
    },
  };
}
