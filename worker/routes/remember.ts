// POST /api/remember -- what should still be true next week?
//
// Three outputs from one call, because they all need the same reading of the
// same conversation:
//
//   learned  facts about them          -> the friend's memory
//   moment   a name for what happened  -> the shared scrapbook
//   trait    how the friend changed    -> character evolution
//
// Called every few exchanges, not every message: durable things do not
// arrive one per turn, and running this each time would fill the memory with
// "they said hi".

import { anthropic, MODEL, EFFORT } from '../lib/anthropic';
import { fail, json, readJson } from '../lib/json';
import { getPersona } from '../prompt/persona';
import type { Env, RememberRequest } from '../types';

const INSTRUCTIONS = `You are keeping the notes a friend keeps in their head about someone.

Read the conversation and reply with JSON, nothing else:

{"learned":[],"moment":null,"trait":null}

**learned** -- only what is worth still knowing in a month: people in their life, what they are studying or working on, what they are afraid of, what they are working towards, what happened to them, what they have asked you never to bring up.
- Twelve words or fewer each, written the way a person would remember it.
- Nothing about the weather of the conversation itself. Not "they seemed sad today", not "they said hello".
- Nothing already in the existing notes, unless it changed -- then write the new version.
- An empty array is the right answer when nothing was said worth keeping.

**moment** -- a name for what happened here, only if something did. "That terrible Tuesday", "Your presentation day", "The night you quit". Five words or fewer, no date, no explanation. Most stretches of conversation do not earn one, so null is the normal answer.

**trait** -- one way YOU have changed by talking to them, only if you actually have. "I stopped asking about her father", "I use their word for it now", "I let silences run longer". Null is the normal answer.`;

/** Trims to a plain non-empty string within a length, or null. */
function short(value: unknown, limit: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= limit ? trimmed : null;
}

export async function handleRemember(request: Request, env: Env): Promise<Response> {
  const body = await readJson<RememberRequest>(request);
  if (!body || !Array.isArray(body.messages)) return fail('messages is required.');
  if (!getPersona(body.characterId)) return fail(`No such character: ${body.characterId}`, 404);

  const existing = (body.memory ?? []).map((fact) => `- ${fact}`).join('\n') || '(none yet)';
  const transcript = body.messages
    .map((message) => `${message.role === 'user' ? 'Them' : 'You'}: ${message.text}`)
    .join('\n');

  const client = anthropic(env);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    output_config: { effort: EFFORT },
    system: INSTRUCTIONS,
    messages: [
      { role: 'user', content: `Existing notes:\n${existing}\n\nConversation:\n${transcript}` },
    ],
  });

  const text = response.content
    .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  try {
    const parsed = JSON.parse(text.replace(/^```(?:json)?|```$/g, '').trim()) as {
      learned?: unknown;
      moment?: unknown;
      trait?: unknown;
    };

    const learned = Array.isArray(parsed.learned)
      ? parsed.learned
          .map((line) => short(line, 120))
          .filter((line): line is string => line !== null)
      : [];

    return json({ learned, moment: short(parsed.moment, 60), trait: short(parsed.trait, 120) });
  } catch {
    // A memory pass that cannot be parsed is a memory pass that did not
    // happen. The browser leaves its cursor where it was and tries again
    // with the same messages next time.
    return fail('The memory pass came back unreadable.', 502);
  }
}
