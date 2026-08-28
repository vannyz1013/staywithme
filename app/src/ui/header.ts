// The bar across the top of the chat: who you are talking to, the way back,
// and the way into what they know about you.

import { el } from '../core/el';
import type { Character } from '../characters/types';
import { t } from '../i18n/current';
import { avatar } from './avatar';

export interface HeaderActions {
  onBack: () => void;
  onOpenAbout: () => void;
}

export function chatHeader(character: Character, actions: HeaderActions): HTMLElement {
  const strings = t();

  return el('header', { class: 'chat-header', style: `--hue:${character.hue}` }, [
    el(
      'button',
      { class: 'icon-button', type: 'button', 'aria-label': strings.back, onclick: actions.onBack },
      [el('span', { text: '←' })],
    ),
    // The name and face are the way in to the relationship screen -- tapping
    // who you are talking to is a more natural door than a settings cog.
    el(
      'button',
      {
        class: 'chat-header-who',
        type: 'button',
        'aria-label': `${strings.aboutFriend} ${character.name}`,
        onclick: actions.onOpenAbout,
      },
      [
        avatar(character, 'sm'),
        el('span', { class: 'chat-header-name' }, [
          el('strong', { text: character.name }),
          el('span', { class: 'chat-header-tagline', text: character.tagline }),
        ]),
      ],
    ),
  ]);
}
