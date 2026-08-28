// How this friend has changed by knowing you.
//
// The other half of memory. `memory` is what they know about you; this is
// what you have done to them -- picked up your slang, learned when to stop
// pushing, stopped asking about the thing you hate being asked about.
//
// It is the difference between a character and a relationship.

export function evolutionBlock(traits: string[] | undefined): string | null {
  if (!traits || traits.length === 0) return null;

  return (
    `How you have changed since you met them, oldest first:\n` +
    traits.map((trait) => `- ${trait}`).join('\n') +
    `\n\nThese are yours now. Do not announce them and do not explain them -- just be this way.`
  );
}
