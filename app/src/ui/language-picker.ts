// Choosing the language.
//
// One control for two things, because to the person using it they are the
// same thing: what the buttons say, and what the companion answers in. The
// default is "follow me", which needs no setting at all -- this exists for
// people whose typing language and comfort language are different.

import { el } from '../core/el';
import { currentLanguage, setLanguage, t } from '../i18n/current';
import { LANGUAGES, type LanguageId } from '../i18n/languages';

export function languagePicker(onChange: () => void): HTMLElement {
  const select = el('select', { class: 'language', 'aria-label': t().language });

  for (const language of LANGUAGES) {
    const option = el('option', { value: language.id, text: language.label });
    if (language.id === currentLanguage()) option.selected = true;
    select.append(option);
  }

  select.addEventListener('change', () => {
    setLanguage(select.value as LanguageId);
    onChange();
  });

  return select;
}
