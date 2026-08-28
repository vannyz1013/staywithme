// One friend on the choosing screen.

import { el } from '../core/el';
import type { Character } from '../characters/types';
import { avatar } from './avatar';

export function characterCard(character: Character, onPick: (id: string) => void): HTMLElement {
  return el(
    'button',
    {
      class: 'card',
      type: 'button',
      style: `--hue:${character.hue}`,
      onclick: () => onPick(character.id),
    },
    [
      avatar(character, 'lg'),
      el('span', { class: 'card-name', text: character.name }),
      el('span', { class: 'card-tagline', text: character.tagline }),
      el('span', { class: 'card-blurb', text: character.blurb }),
    ],
  );
}
