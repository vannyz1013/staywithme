// POST /api/state -- how is this conversation actually going?
//
// Four readings: mood, energy, whether they want advice, whether they want
// company. The last two are the ones that matter -- they are what stops a
// friend from problem-solving at someone who only wanted to be heard.
//
// Fired in parallel with /api/chat, so it costs a call but no waiting.

import { provider } from '../lib/model';
import { fail, json, readJson } from '../lib/json';
import { invalid } from './chat';
import type { Env, StateRequest } from '../types';

const INSTRUCTIONS = `You read conversations. Given the last few messages, report how the person writing them seems right now.

Reply with JSON and nothing else, in exactly this shape:
{"mood":"one word","energy":"low|medium|high","wantsAdvice":true,"wantsCompany":true}

- mood: one plain word -- tired, low, angry, anxious, hopeful, flat, okay, restless.
- energy: exactly one of low, medium, high.
- wantsAdvice: true only if they are actually asking what to do. Venting is not asking.
- wantsCompany: true if they mainly want someone there rather than something solved.

No explanation, no markdown fence, no other keys.`;

export async function handleState(request: Request, env: Env): Promise<Response> {
  const body = await readJson<StateRequest>(request);
  if (!body) return fail('Body was not valid JSON.');

  const problem = invalid(body.messages, false);
  if (problem) return fail(problem);

  const transcript = body.messages
    .slice(-6)
    .map((message) => `${message.role === 'user' ? 'Them' : 'Friend'}: ${message.text}`)
    .join('\n');

  const text = (
    await provider(env).once(env, {
      system: INSTRUCTIONS,
      messages: [{ role: 'user', text: transcript }],
      // A four-field reading, not a judgement call.
      maxTokens: 200,
    })
  ).trim();

  // Bare JSON was asked for, but a fence would still parse as a failure --
  // and this reading is not worth a retry, so the browser just keeps the
  // state it had.
  try {
    return json({ state: JSON.parse(text.replace(/^```(?:json)?|```$/g, '').trim()) });
  } catch {
    return json({ state: null });
  }
}
