// One message. Returns a handle rather than a bare node because the
// assistant's bubble is created empty and filled in as the reply streams.

import { el } from '../core/el';
import { clockTime } from '../core/time';
import { photoStrip } from './photo-strip';

export interface Bubble {
  node: HTMLElement;
  setText(text: string): void;
}

export interface BubbleOptions {
  role: 'user' | 'assistant';
  text: string;
  at: string;
  hue: number;
  images?: string[];
}

export function bubble(options: BubbleOptions): Bubble {
  // textContent, never innerHTML: what someone types is text, and the reply
  // is text the model wrote. Neither is markup.
  const body = el('p', { class: 'bubble-text', text: options.text });

  const node = el('div', { class: `bubble bubble-${options.role}`, style: `--hue:${options.hue}` }, [
    options.images && options.images.length > 0 ? photoStrip(options.images) : null,
    body,
    el('time', { class: 'bubble-time', datetime: options.at, text: clockTime(options.at) }),
  ]);

  return {
    node,
    setText(next: string) {
      body.textContent = next;
    },
  };
}
