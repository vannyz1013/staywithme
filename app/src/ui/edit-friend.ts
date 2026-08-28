// Making a companion yours: what they are called, their gender, their age,
// and how you want them to be.
//
// The last field is the powerful one. It goes into the system prompt beneath
// the written personality and overrides it, so "quieter", "funnier", "call me
// out more" and "speak Manglish with me" all work without any of them being
// a feature anyone had to build.

import type { FriendProfile } from '../characters/profile';
import { NOTE_LIMIT } from '../characters/profile';
import { el } from '../core/el';
import { t } from '../i18n/current';

export interface EditFriendOptions {
  /** The written name, shown as the placeholder so clearing is obvious. */
  writtenName: string;
  profile: FriendProfile;
  onSave: (profile: FriendProfile) => void;
  onClose: () => void;
}

function field(label: string, value: string | undefined, placeholder: string): HTMLInputElement {
  const input = el('input', { class: 'field', type: 'text', placeholder, 'aria-label': label });
  input.value = value ?? '';
  return input;
}

export function editFriendPanel(options: EditFriendOptions): HTMLElement {
  const strings = t();

  const name = field(strings.theirName, options.profile.name, options.writtenName);
  const gender = field(strings.theirGender, options.profile.gender, 'however you picture them');
  const age = field(strings.theirAge, options.profile.age, 'older than me / 24 / no idea');

  const note = el('textarea', {
    class: 'field field-note',
    rows: '4',
    maxlength: String(NOTE_LIMIT),
    placeholder: strings.patternHint,
    'aria-label': strings.theirPattern,
  });
  note.value = options.profile.note ?? '';

  const panel = el(
    'div',
    { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': strings.makeThemYours },
    [
      el('form', { class: 'sheet-body' }, [
        el('h2', { class: 'sheet-title', text: strings.makeThemYours }),
        el('label', { class: 'field-label', text: strings.theirName }),
        name,
        el('label', { class: 'field-label', text: strings.theirGender }),
        gender,
        el('label', { class: 'field-label', text: strings.theirAge }),
        age,
        el('label', { class: 'field-label', text: strings.theirPattern }),
        note,
        el('div', { class: 'sheet-actions' }, [
          el('button', { class: 'link', type: 'button', text: strings.cancel, onclick: options.onClose }),
          el('button', { class: 'primary', type: 'submit', text: strings.save }),
        ]),
      ]),
    ],
  );

  panel.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    options.onSave({
      name: name.value,
      gender: gender.value,
      age: age.value,
      note: note.value,
    });
  });

  panel.addEventListener('click', (event) => {
    if (event.target === panel) options.onClose();
  });

  return panel;
}
