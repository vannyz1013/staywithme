// Google Gemini, over the REST API.
//
// Called with fetch rather than the SDK: a Worker has fetch natively, the
// surface used here is four fields wide, and it keeps the bundle small.
//
// Free tier, which is why this is the default. Two things about it are worth
// knowing and are documented in SETUP.md rather than hidden: Google uses
// free-tier conversations to improve their models, and there are per-minute
// and per-day request limits that return 429 rather than a bill.

import type { Env } from '../types';
import { DECLINED, type ChatOptions, type ModelMessage, type Provider } from './model';

/** Named as free-tier eligible on the pricing page. */
const MODEL = 'gemini-3.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Gemini's own filters sit on top of the app's safety prompt, and they are
 * blunter than it is: a conversation about self-harm is exactly what this app
 * exists for, and a filter that kills the turn leaves someone at their lowest
 * staring at a dead chat. BLOCK_ONLY_HIGH keeps the extreme cases blocked
 * while letting the app's own SAFETY block -- which stays in the conversation
 * and names real help -- do the work it was written for.
 */
const SAFETY = [
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
].map((category) => ({ category, threshold: 'BLOCK_ONLY_HIGH' }));

interface Part {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

/**
 * Gemini requires the conversation to begin with the person, but every thread
 * here opens with the companion's written greeting. Those leading turns are
 * dropped -- the greeting is already on screen, and the model does not need
 * to be told what it said before anyone spoke.
 */
function toContents(messages: ModelMessage[]) {
  const first = messages.findIndex((message) => message.role === 'user');
  const usable = first === -1 ? [] : messages.slice(first);

  return usable.map((message) => {
    const parts: Part[] = [];

    for (const image of message.images ?? []) {
      parts.push({ inline_data: { mime_type: image.mediaType, data: image.data } });
    }
    // Text after the picture: a caption reads better once the thing being
    // captioned has been seen.
    parts.push({ text: message.text || 'Look at this.' });

    return { role: message.role === 'assistant' ? 'model' : 'user', parts };
  });
}

function body(options: ChatOptions): string {
  return JSON.stringify({
    systemInstruction: { parts: [{ text: options.system }] },
    contents: toContents(options.messages),
    safetySettings: SAFETY,
    generationConfig: {
      maxOutputTokens: options.maxTokens,
      // Conversation, not extraction. A companion who answers the same way
      // every time is not one.
      temperature: 0.9,
    },
  });
}

async function call(env: Env, options: ChatOptions, streaming: boolean): Promise<Response> {
  const method = streaming ? 'streamGenerateContent?alt=sse' : 'generateContent';

  const response = await fetch(`${BASE}/${MODEL}:${method}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // In the header, not the query string: keys in URLs end up in logs.
      'x-goog-api-key': env.GEMINI_API_KEY,
    },
    body: body(options),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');

    // Google's error bodies are long nested JSON. Nobody using a chat app
    // should have to read one, so the two that actually happen get a sentence.
    if (response.status === 429) {
      throw new Error(
        "Google's free tier has a rate limit and this hit it. Wait a minute and try again.",
      );
    }
    if (/API key not valid|API_KEY_INVALID/i.test(detail)) {
      throw new Error(
        'The Gemini key on this Worker is not valid. Get one free at aistudio.google.com/apikey and set it again.',
      );
    }

    throw new Error(`Gemini could not answer (${response.status}).`);
  }

  return response;
}

/** Pulls every piece of text out of one Gemini JSON chunk. */
function textFrom(payload: unknown): string {
  const chunk = payload as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const parts = chunk.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? '').join('');
}

export const geminiProvider: Provider = {
  name: 'gemini',

  async *stream(env, options) {
    const response = await call(env, options, true);
    if (!response.body) throw new Error('Gemini returned no body to stream.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let said = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line; the tail is usually a
      // partial frame, so it waits for the next read.
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const raw = /^data: (.+)$/m.exec(frame)?.[1];
        if (!raw || raw === '[DONE]') continue;

        let text = '';
        try {
          text = textFrom(JSON.parse(raw));
        } catch {
          // A frame that will not parse is one chunk of one reply. Dropping
          // it beats killing the whole message.
          continue;
        }

        if (text) {
          said = true;
          yield text;
        }
      }
    }

    // Blocked before it said anything: the person is owed a sentence rather
    // than an empty bubble.
    if (!said) yield DECLINED;
  },

  async once(env, options) {
    const response = await call(env, options, false);
    return textFrom(await response.json());
  },
};
