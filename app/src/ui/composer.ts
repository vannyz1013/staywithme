// The box you type in, and the button that attaches a picture.
//
// Enter sends, Shift+Enter makes a new line -- the messaging convention, not
// the form convention. The textarea grows with the text up to a cap so a long
// message is visible without swallowing the conversation.

import { el } from '../core/el';
import { t } from '../i18n/current';
import { pickFile } from '../media/pick-file';

export interface Composer {
  node: HTMLElement;
  focus(): void;
  /** Disables everything while a reply is streaming. */
  setBusy(busy: boolean): void;
}

export interface ComposerOptions {
  onSend: (text: string, images: string[]) => void;
  /** Told when a video was attached, so the chat can explain what happened. */
  onVideoAttached?: () => void;
}

const MAX_HEIGHT = 140;

export function composer(options: ComposerOptions): Composer {
  const strings = t();
  let pending: string[] = [];

  const input = el('textarea', {
    class: 'composer-input',
    rows: '1',
    placeholder: strings.say,
    'aria-label': strings.say,
  });

  const attach = el('button', {
    class: 'composer-attach',
    type: 'button',
    'aria-label': strings.attach,
    title: strings.attach,
    text: '+',
  });

  const button = el('button', { class: 'composer-send', type: 'submit', 'aria-label': 'Send' }, [
    el('span', { text: '↑' }),
  ]);

  // Thumbnails of what is about to go up, so nobody sends a picture they
  // cannot see.
  const tray = el('div', { class: 'tray', hidden: 'hidden' });

  function drawTray(): void {
    tray.replaceChildren(
      ...pending.map((src, index) =>
        el('button', {
          class: 'tray-item',
          type: 'button',
          style: `background-image:url(${src})`,
          'aria-label': 'Remove this picture',
          onclick: () => {
            pending = pending.filter((_, at) => at !== index);
            drawTray();
          },
        }),
      ),
    );
    tray.hidden = pending.length === 0;
  }

  function grow(): void {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, MAX_HEIGHT)}px`;
  }

  function submit(): void {
    const text = input.value.trim();
    // A picture on its own is a message. Text is not required.
    if ((!text && pending.length === 0) || input.disabled) return;

    const images = pending;
    pending = [];
    drawTray();
    input.value = '';
    grow();
    options.onSend(text, images);
  }

  attach.addEventListener('click', async () => {
    const picked = await pickFile();
    if (!picked || picked.images.length === 0) return;
    pending = [...pending, ...picked.images].slice(0, 3);
    drawTray();
    if (picked.fromVideo) options.onVideoAttached?.();
  });

  input.addEventListener('input', grow);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });

  const form = el('form', { class: 'composer' }, [
    tray,
    el('div', { class: 'composer-row' }, [attach, input, button]),
  ]);

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
      attach.disabled = busy;
      if (!busy) input.focus();
    },
  };
}
