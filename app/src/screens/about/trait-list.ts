// How the companion has changed by knowing you.
//
// The other direction of memory: not what they learned about you, but what
// talking to you did to them. "I stopped asking about her father." This is
// where familiarity actually lives, instead of in a number.

import { el } from '../../core/el';
import { t } from '../../i18n/current';

export function traitList(traits: string[]): HTMLElement {
  const strings = t();

  return el(
    'ul',
    { class: 'traits' },
    traits.length > 0
      ? traits.map((trait) => el('li', { class: 'trait', text: trait }))
      : [el('li', { class: 'empty', text: strings.changedEmpty })],
  );
}
