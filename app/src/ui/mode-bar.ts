// Talk / Vent / Advice / Listen / Stay.
//
// One row above the composer. Switching does not start a new conversation
// and does not touch memory -- it changes how the companion is with you,
// which happens server-side in worker/prompt/mode.ts.

import { el } from '../core/el';
import { MODES, type ModeId } from '../modes/list';

export interface ModeBar {
  node: HTMLElement;
  set(mode: ModeId): void;
}

export function modeBar(current: ModeId, onPick: (mode: ModeId) => void): ModeBar {
  const buttons = MODES.map((mode) =>
    el(
      'button',
      {
        class: 'mode',
        type: 'button',
        'data-mode': mode.id,
        'aria-pressed': String(mode.id === current),
        title: mode.blurb,
        onclick: () => onPick(mode.id),
      },
      [
        el('span', { class: 'mode-icon', text: mode.icon, 'aria-hidden': 'true' }),
        el('span', { class: 'mode-label', text: mode.label }),
      ],
    ),
  );

  return {
    node: el('div', { class: 'mode-bar', role: 'group', 'aria-label': 'How you want to talk' }, buttons),
    set(mode: ModeId) {
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      }
    },
  };
}
