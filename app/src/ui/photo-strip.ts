// The pictures attached to a message.
//
// Object-fit cover in a fixed box: a portrait phone photo and a landscape
// screenshot have to sit next to each other without one of them deciding how
// tall the bubble is.

import { el } from '../core/el';

export function photoStrip(images: string[]): HTMLElement {
  return el(
    'div',
    { class: 'photos' },
    images.map((src) =>
      el('img', {
        class: 'photo',
        src,
        alt: 'Shared picture',
        loading: 'lazy',
        decoding: 'async',
      }),
    ),
  );
}
