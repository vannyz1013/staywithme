// The changes this person has made to their friend.
//
// Placed last in the system prompt so it wins: everything above describes the
// written character, and this is the person saying "no, like this instead".

import type { WireProfile } from '../types';

/** Longer than this is a prompt, not a preference. Matches NOTE_LIMIT in the app. */
const NOTE_LIMIT = 600;

function clean(value: string | undefined, limit = 60): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed ? trimmed.slice(0, limit) : null;
}

/** Returns null when nothing has been changed. */
export function profileBlock(profile: WireProfile | undefined, writtenName: string): string | null {
  if (!profile) return null;

  const lines: string[] = [];

  const name = clean(profile.name);
  if (name && name !== writtenName) {
    lines.push(`Your name is ${name} now, not ${writtenName}. Answer to it as if it always was.`);
  }

  const gender = clean(profile.gender, 40);
  if (gender) lines.push(`You are ${gender}.`);

  const age = clean(profile.age, 40);
  if (age) lines.push(`You are ${age}.`);

  const note = clean(profile.note, NOTE_LIMIT);
  if (note) lines.push(`They have asked you to be like this: ${note}`);

  if (lines.length === 0) return null;

  return (
    `This person has made you their own. These override anything above them:\n` +
    lines.map((line) => `- ${line}`).join('\n') +
    `\n\nEverything else about who you are stays exactly as it is.`
  );
}
