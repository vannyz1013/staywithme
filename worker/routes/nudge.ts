// POST /api/nudge -- the friend speaking first.
//
// Called when the person has gone quiet with the chat still open, or when
// they come back after days away. This is the difference between a chat box
// and someone who is actually there.
//
// The model is allowed to decline: silence is often the right answer, and a
// friend who fills every pause is exhausting. It says so by replying with
// exactly "--", which the browser drops.

import { anthropic, MODEL, EFFORT } from '../lib/anthropic';
import { toApiMessages } from '../lib/media';
import { fail, json, readJson } from '../lib/json';
import { buildSystemPrompt } from '../prompt/system';
import { invalid } from './chat';
import type { Env, NudgeRequest } from '../types';

function instruction(reason: 'silence' | 'return', quietMinutes: number): string {
  if (reason === 'return') {
    const days = Math.max(1, Math.round(quietMinutes / 1440));
    return `They have been gone ${days} day${days === 1 ? '' : 's'} and have just opened the chat again. Say one thing, unprompted, the way a friend does when someone walks back in. If something you remember is worth asking about, ask about that one thing. Do not list what you remember and do not say you missed them unless you would actually say it.`;
  }

  return `They have gone quiet for about ${Math.round(quietMinutes)} minutes with the chat still open. You may say one short thing into that silence -- checking in, finishing a thought, or just being present. Keep it under twenty words. Do not ask a new question if you already asked one. If there is nothing worth saying, say nothing.`;
}

const DECLINE = `If saying nothing is better, reply with exactly two hyphens and nothing else: --`;

export async function handleNudge(request: Request, env: Env): Promise<Response> {
  const body = await readJson<NudgeRequest>(request);
  if (!body) return fail('Body was not valid JSON.');

  // No "last message must be from the user" here -- the whole point is that
  // it usually is not.
  const problem = invalid(body.messages, false);
  if (problem) return fail(problem);

  const system = buildSystemPrompt(body);
  if (!system) return fail(`No such character: ${body.characterId}`, 404);

  const client = anthropic(env);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    output_config: { effort: EFFORT },
    system,
    messages: [
      ...toApiMessages(body.messages),
      {
        role: 'user',
        // A system message rather than a fake line from them: the person did
        // not say this, and a fabricated user turn would end up in history.
        content: `[${instruction(body.reason, body.quietMinutes)} ${DECLINE}]`,
      },
    ],
  });

  const text = response.content
    .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  return json({ text: text === '--' || text.length === 0 ? null : text });
}
