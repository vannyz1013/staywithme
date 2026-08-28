// Assembles the system prompt for one turn: who the friend is, how anyone
// here talks, what to do if things get serious, and what this friend already
// knows about this person.
//
// Deliberately not cached (`cache_control`): the whole thing lands around
// 600 tokens, under the minimum cacheable prefix, so a breakpoint here would
// cost a line of code and buy nothing.

import { getPersona } from './persona';
import { VOICE } from './voice';
import { SAFETY } from './safety';

export function buildSystemPrompt(
  characterId: string,
  memory: string[],
  displayName?: string,
): string | null {
  const persona = getPersona(characterId);
  if (!persona) return null;

  const parts = [persona.prompt, VOICE, SAFETY];

  if (displayName) {
    parts.push(`They go by ${displayName}. Use it the way a friend would -- occasionally, not every message.`);
  }

  if (memory.length > 0) {
    parts.push(
      `What you remember about them from before, most recent last:\n` +
        memory.map((m) => `- ${m}`).join('\n') +
        `\n\nUse this the way a friend uses memory: bring something up when it is relevant, not to prove you remembered. If something here is out of date, believe what they tell you now.`,
    );
  } else {
    parts.push(`You have not spoken before. Do not pretend otherwise.`);
  }

  return parts.join('\n\n---\n\n');
}
