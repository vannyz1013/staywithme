// Languages the app can be read in, and answered in.
//
// 'auto' is the default and the honest one: the companion replies in
// whatever you wrote, mixing included, which is how anyone bilingual
// actually talks. Choosing a language pins both the interface and the reply.

export type LanguageId = 'auto' | 'en' | 'ms' | 'zh' | 'ta';

export interface Language {
  id: LanguageId;
  /** Written in the language itself, because that is what people look for. */
  label: string;
}

export const LANGUAGES: Language[] = [
  { id: 'auto', label: 'Follow me' },
  { id: 'en', label: 'English' },
  { id: 'ms', label: 'Bahasa Melayu' },
  { id: 'zh', label: '中文' },
  { id: 'ta', label: 'தமிழ்' },
];

/** Which language the interface is drawn in for a given choice. */
export function uiLanguage(language: LanguageId): 'en' | 'ms' | 'zh' | 'ta' {
  return language === 'auto' ? 'en' : language;
}
