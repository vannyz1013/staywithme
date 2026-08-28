// The three dots, shown between sending and the first streamed word.

import { el } from '../core/el';

export function typing(hue: number): HTMLElement {
  return el(
    'div',
    { class: 'bubble bubble-assistant bubble-typing', style: `--hue:${hue}`, 'aria-label': 'typing' },
    [el('span', { class: 'dot' }), el('span', { class: 'dot' }), el('span', { class: 'dot' })],
  );
}
