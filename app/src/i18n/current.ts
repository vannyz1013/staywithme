// The chosen language, and the strings that follow from it.
//
// Held on the device rather than in the account: it is a property of the
// phone you are holding, and someone reading in Malay here should not have
// their friend's laptop switch over too.

import { read, write } from '../core/storage';
import type { LanguageId } from './languages';
import { stringsFor, type Strings } from './strings';

const KEY = 'swm.language';

let cached: LanguageId | null = null;

export function currentLanguage(): LanguageId {
  if (cached === null) cached = read<LanguageId>(KEY, 'auto');
  return cached;
}

export function setLanguage(language: LanguageId): void {
  cached = language;
  write(KEY, language);
}

/** The interface strings for whatever is chosen right now. */
export function t(): Strings {
  return stringsFor(currentLanguage());
}
