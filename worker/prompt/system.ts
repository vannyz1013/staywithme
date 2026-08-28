// Assembles the system prompt for one turn.
//
// Order is deliberate. Who they are comes first because everything after it
// is read in that voice. Then how anyone here talks, then how to carry a
// relationship across days, then what this person came for right now, then
// the specifics of this pair, and last the changes the person made
// themselves -- which win over everything above them.

import { getPersona } from './persona';
import { VOICE } from './voice';
import { CONTINUITY } from './continuity';
import { modeBlock } from './mode';
import { languageBlock } from './language';
import { SAFETY } from './safety';
import { stateBlock } from './state';
import { evolutionBlock } from './evolution';
import { profileBlock } from './profile';
import type { Context } from '../types';

export function buildSystemPrompt(context: Context): string | null {
  const persona = getPersona(context.characterId);
  if (!persona) return null;

  const parts: (string | null)[] = [
    persona.prompt,
    VOICE,
    CONTINUITY,
    modeBlock(context.mode),
    languageBlock(context.language),
    SAFETY,
  ];

  if (context.displayName) {
    parts.push(
      `They go by ${context.displayName}. Use it the way a friend would -- occasionally, not every message.`,
    );
  }

  parts.push(evolutionBlock(context.traits));

  const memory = context.memory ?? [];
  if (memory.length > 0) {
    parts.push(
      `What you know about them, oldest first:\n` +
        memory.map((fact) => `- ${fact}`).join('\n'),
    );
  } else {
    parts.push(`You have not spoken before. Do not pretend otherwise.`);
  }

  parts.push(stateBlock(context.state));
  parts.push(profileBlock(context.profile, persona.name));

  return parts.filter((part): part is string => Boolean(part)).join('\n\n---\n\n');
}
