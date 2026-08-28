// The circle with a letter in it. Every character gets one, built from the
// same hue as their bubbles so the two read as the same person.

import { el } from '../core/el';
import type { Character } from '../characters/types';

export function avatar(character: Character, size: 'sm' | 'lg' = 'sm'): HTMLElement {
  return el('span', {
    class: `avatar avatar-${size}`,
    style: `--hue:${character.hue}`,
    text: character.name.charAt(0),
    'aria-hidden': 'true',
  });
}
