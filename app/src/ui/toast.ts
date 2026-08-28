// A line of text that appears at the bottom and leaves on its own. Used for
// the failures that are worth mentioning but not worth a dialog.

import { el } from '../core/el';

export function toast(message: string): void {
  const node = el('div', { class: 'toast', role: 'status', text: message });
  document.body.append(node);
  // Two frames, so the element is in the document before the class that
  // animates it is added -- otherwise there is nothing to transition from.
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-in')));
  setTimeout(() => {
    node.classList.remove('is-in');
    node.addEventListener('transitionend', () => node.remove(), { once: true });
  }, 3200);
}
