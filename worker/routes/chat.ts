// POST /api/chat -- the companion's reply, streamed back a few words at a time.

import { prepare } from '../lib/media';
import { provider } from '../lib/model';
import { streamText } from '../lib/sse';
import { fail, readJson } from '../lib/json';
import { buildSystemPrompt } from '../prompt/system';
import type { ChatRequest, Env, WireMessage } from '../types';

/** Guards against a malformed body reaching the model and costing a call. */
export function invalid(messages: WireMessage[] | undefined, requireUserLast: boolean): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return 'messages is required.';
  if (messages.some((m) => typeof m?.text !== 'string' || (m.role !== 'user' && m.role !== 'assistant'))) {
    return 'messages must be {role, text} pairs.';
  }
  if (requireUserLast && messages[messages.length - 1]?.role !== 'user') {
    return 'The last message must be from the user.';
  }
  return null;
}

export async function handleChat(request: Request, env: Env): Promise<Response> {
  const body = await readJson<ChatRequest>(request);
  if (!body) return fail('Body was not valid JSON.');

  const problem = invalid(body.messages, true);
  if (problem) return fail(problem);

  const system = buildSystemPrompt(body);
  if (!system) return fail(`No such character: ${body.characterId}`, 404);

  // Resolved before the generator below, which as a hoisted function does not
  // keep the narrowing from the guards above.
  const model = provider(env);
  const options = {
    system,
    messages: prepare(body.messages),
    // A friend's message, not an essay. The prompt asks for a few sentences;
    // this is only the ceiling if it ever ignores that.
    maxTokens: 2000,
  };

  return streamText(model.stream(env, options));
}
