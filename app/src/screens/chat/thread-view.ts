// The scrolling list of messages.
//
// Owns the day separators and the scroll position, and nothing else. Whether
// a message should exist is somebody else's problem.

import { el } from '../../core/el';
import { dayLabel } from '../../core/time';
import type { StoredMessage } from '../../repo/types';
import { bubble } from '../../ui/bubble';

export interface ThreadView {
  node: HTMLElement;
  paint(message: StoredMessage): void;
  /** For the outgoing message, which is drawn before it is stored. */
  paintRaw(role: 'user' | 'assistant', text: string, at: string, images?: string[]): void;
  scrollToEnd(): void;
  reset(): void;
}

export function threadView(hue: number): ThreadView {
  const node = el('div', { class: 'thread' });
  let lastDay = '';

  function daySeparator(at: string): void {
    const label = dayLabel(at);
    if (label === lastDay) return;
    lastDay = label;
    node.append(el('div', { class: 'day', text: label }));
  }

  function paintRaw(
    role: 'user' | 'assistant',
    text: string,
    at: string,
    images?: string[],
  ): void {
    daySeparator(at);
    node.append(bubble({ role, text, at, hue, images }).node);
  }

  return {
    node,
    paintRaw,
    paint: (message) => paintRaw(message.role, message.text, message.at, message.images),
    scrollToEnd: () => {
      node.scrollTop = node.scrollHeight;
    },
    reset: () => {
      node.replaceChildren();
      lastDay = '';
    },
  };
}
