// How this conversation is going, at the top of the chat.
//
// Shown because it is acted on: "wants advice: no" is why the friend stops
// suggesting things, and hiding that would make the change look like a mood
// swing rather than a response.

import { el } from '../core/el';
import type { ConversationState } from '../friendship/state';

export interface StatePanel {
  node: HTMLElement;
  update(state: ConversationState): void;
}

function row(label: string, value: string): HTMLElement {
  return el('div', { class: 'state-row' }, [
    el('span', { class: 'state-label', text: label }),
    el('span', { class: 'state-value', text: value }),
  ]);
}

export function statePanel(hue: number): StatePanel {
  const body = el('div', { class: 'state-body' });
  const node = el('section', { class: 'state', style: `--hue:${hue}`, hidden: 'hidden' }, [
    el('h2', { class: 'state-title', text: 'Right now' }),
    body,
  ]);

  return {
    node,
    update(state: ConversationState) {
      body.replaceChildren(
        row('Mood', state.mood),
        row('Energy', state.energy),
        row('Wants advice', state.wantsAdvice ? 'yes' : 'no'),
        row('Wants company', state.wantsCompany ? 'yes' : 'no'),
      );
      node.hidden = false;
    },
  };
}
