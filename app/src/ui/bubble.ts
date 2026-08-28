// One message. Returns a handle rather than a bare node because the
// assistant's bubble is created empty and filled in as the reply streams.

import { el } from '../core/el';
import { clockTime } from '../core/time';

export interface Bubble {
  node: HTMLElement;
  setText(text: string): void;
}

export function bubble(role: 'user' | 'assistant', text: string, at: string, hue: number): Bubble {
  // textContent, never innerHTML: what someone types is text, and the reply
  // is text the model wrote. Neither is markup.
  const body = el('p', { class: 'bubble-text', text });
  const node = el('div', { class: `bubble bubble-${role}`, style: `--hue:${hue}` }, [
    body,
    el('time', { class: 'bubble-time', datetime: at, text: clockTime(at) }),
  ]);

  return {
    node,
    setText(next: string) {
      body.textContent = next;
    },
  };
}
