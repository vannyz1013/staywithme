// The bar across the top of the chat: who you are talking to, the way back,
// and the way to start over.

import { el } from '../core/el';
import type { Character } from '../characters/types';
import { avatar } from './avatar';

export interface HeaderActions {
  onBack: () => void;
  onClear: () => void;
}

export function chatHeader(character: Character, actions: HeaderActions): HTMLElement {
  return el('header', { class: 'chat-header', style: `--hue:${character.hue}` }, [
    el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Back', onclick: actions.onBack }, [
      el('span', { text: '←' }),
    ]),
    avatar(character, 'sm'),
    el('div', { class: 'chat-header-who' }, [
      el('strong', { text: character.name }),
      el('span', { class: 'chat-header-tagline', text: character.tagline }),
    ]),
    el(
      'button',
      { class: 'icon-button', type: 'button', 'aria-label': 'Start over', title: 'Start over', onclick: actions.onClear },
      [el('span', { text: '⟳' })],
    ),
  ]);
}
