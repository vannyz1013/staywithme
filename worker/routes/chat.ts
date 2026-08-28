// POST /api/chat -- the friend's reply, streamed back a few words at a time.

import { anthropic, MODEL, EFFORT } from '../lib/anthropic';
import { toApiMessages } from '../lib/media';
import { streamText } from '../lib/sse';
import { fail, readJson } from '../lib/json';
import { buildSystemPrompt } from '../prompt/system';
import type { ChatRequest, Env, WireMessage } from '../types';

/** Guards against a malformed body reaching the API and costing a call. */
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

  // Pulled out of the generator below: a hoisted `function*` does not keep
  // the narrowing from the guards above, and naming them once reads better
  // than `body!` throughout.
  const client = anthropic(env);
  const systemPrompt: string = system;
  const messages = toApiMessages(body.messages);

  async function* reply(): AsyncGenerator<string> {
    const stream = client.beta.messages.stream({
      model: MODEL,
      // A friend's message, not an essay. The prompt asks for a few
      // sentences; this is the ceiling if it ever ignores that.
      max_tokens: 2000,
      output_config: { effort: EFFORT },
      system: systemPrompt,
      messages,
      // People bring their worst nights to an app called Stay With Me, and
      // a safety classifier declining one of those is the moment the app
      // most needs to still say something. This routes the turn to another
      // model instead of returning a refusal.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    let said = false;
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        said = true;
        yield event.delta.text;
      }
      // If the fallback above also declines, the person is still owed a
      // human sentence rather than a dead chat bubble.
      if (event.type === 'message_delta' && event.delta.stop_reason === 'refusal' && !said) {
        yield "Sorry -- I can't go there with you. I'm still here though, if you want to talk about something else.";
      }
    }
  }

  return streamText(reply());
}
