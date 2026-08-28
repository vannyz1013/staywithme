// What language to answer in.
//
// The default is to follow the person: whatever they wrote in, including a
// mix, is what comes back. That is what a bilingual friend does and no
// setting is needed for it.
//
// The setting exists for the case the default cannot cover -- someone who
// types in English out of habit but wants to be answered in Malay, or who is
// more themselves in Chinese than in the language they were educated in.

const NAMES: Record<string, string> = {
  auto: '',
  en: 'English',
  ms: 'Bahasa Melayu',
  zh: '中文 (Chinese)',
  ta: 'தமிழ் (Tamil)',
};

export function languageBlock(language: string | undefined): string | null {
  if (!language || language === 'auto') {
    return `Answer in whatever language they wrote in, including a mix of them. Malay, English, Manglish, Chinese, Tamil, or any switching between -- follow them without remarking on it.`;
  }

  const name = NAMES[language];
  if (!name) return null;

  return `Answer in ${name}, even when they write to you in something else. Keep it natural rather than formal -- how a friend speaks it, not how a textbook does. If they use a word from another language because it fits better, use it back.`;
}

export const LANGUAGES = Object.keys(NAMES);
