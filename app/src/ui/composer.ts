// The box you type in.
//
// Enter sends, Shift+Enter makes a new line -- the messaging convention,
// not the form convention. The textarea grows with the text up to a cap so
// a long message is visible without swallowing the conversation.

import { el } from '../core/el';

export interface Composer {
  node: HTMLElement;
  focus(): void;
  /** Disables the input while a reply is streaming. */
  setBusy(busy: boolean): void;
}

const MAX_HEIGHT = 140;

export function composer(onSend: (text: string) => void): Composer {
  const input = el('textarea', {
    class: 'composer-input',
    rows: '1',
    placeholder: 'Say something...',
    'aria-label': 'Your message',
  });

  const button = el('button', { class: 'composer-send', type: 'submit', 'aria-label': 'Send' }, [
    el('span', { text: '↑' }),
  ]);

  function grow(): void {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, MAX_HEIGHT)}px`;
  }

  function submit(): void {
    const text = input.value.trim();
    if (!text || input.disabled) return;
    input.value = '';
    grow();
    onSend(text);
  }

  input.addEventListener('input', grow);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });

  const form = el('form', { class: 'composer' }, [input, button]);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  return {
    node: form,
    focus: () => input.focus(),
    setBusy(busy: boolean) {
      input.disabled = busy;
      button.disabled = busy;
      if (!busy) input.focus();
    },
  };
}
