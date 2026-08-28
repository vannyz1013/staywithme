// POST /api/remember -- what should this friend still know next week?
//
// Called by the browser every few exchanges, not on every message: memory is
// for durable things, and running it per-message would both cost more and
// fill the list with "they said hi".

import { anthropic, MODEL, EFFORT } from '../lib/anthropic';
import { fail, json, readJson } from '../lib/json';
import { getPersona } from '../prompt/persona';
import type { Env, RememberRequest } from '../types';

const INSTRUCTIONS = `You are keeping the notes a friend keeps in their head about someone.

Read the conversation and write down only what is worth still knowing in a month: names of people in their life, what they are studying or working on, what they are afraid of, what they are working towards, what happened to them, what they have asked you not to bring up.

Rules:
- One fact per line. No bullets, no numbering, no preamble.
- Twelve words or fewer per line. Write it as a person would remember it, not as a database row.
- Nothing about the weather of the conversation itself -- not "they seemed sad today", not "they said hello".
- Nothing already in the existing notes, unless it has changed, in which case write the new version.
- If nothing in this conversation is worth keeping, write nothing at all.`;

export async function handleRemember(request: Request, env: Env): Promise<Response> {
  const body = await readJson<RememberRequest>(request);
  if (!body || !Array.isArray(body.messages)) return fail('messages is required.');
  if (!getPersona(body.characterId)) return fail(`No such character: ${body.characterId}`, 404);

  const existing = (body.memory ?? []).map((m) => `- ${m}`).join('\n') || '(none yet)';
  const transcript = body.messages
    .map((m) => `${m.role === 'user' ? 'Them' : 'You'}: ${m.text}`)
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
    .join('\n');

  const learned = text
    .split('\n')
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter((line) => line.length > 0 && line.length <= 120);

  return json({ learned });
}
