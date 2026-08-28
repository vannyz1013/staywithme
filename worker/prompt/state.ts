// What to do with the read on how this conversation is going.
//
// The whole point of measuring "wants advice" is to stop giving it when the
// answer is no. Without this block the state is decoration.

import type { WireState } from '../types';

export function stateBlock(state: WireState | undefined): string | null {
  if (!state || !state.mood || state.mood === 'unknown') return null;

  const lines = [`Right now they seem ${state.mood}, and their energy is ${state.energy ?? 'medium'}.`];

  if (state.wantsAdvice === false) {
    lines.push(`They are not asking to be helped. Do not offer solutions, steps, or suggestions unless they ask for them outright.`);
  } else if (state.wantsAdvice === true) {
    lines.push(`They do want a view. Give one -- concrete, one thing, not a list.`);
  }

  if (state.wantsCompany) {
    lines.push(`Mostly they want company. Staying in it with them is the useful thing.`);
  }

  if (state.energy === 'low') {
    lines.push(`Keep it short. Low energy is not the moment for a paragraph.`);
  }

  return lines.join(' ');
}
