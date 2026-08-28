// Reads the reply off the Worker as it is written.
//
// A plain fetch + ReadableStream rather than EventSource, because
// EventSource cannot POST and the whole conversation has to go up with the
// request.

import { CHAT_URL } from '../config/api-config';
import type { FriendContext } from './context';
import type { OnChunk, WireMessage } from './types';

export interface StreamOptions {
  context: FriendContext;
  messages: WireMessage[];
  onChunk: OnChunk;
  signal?: AbortSignal;
}

/**
 * The Worker reports failures as {"error": "..."}. Unwrap it -- the message
 * inside is written for a person, and the JSON around it is not.
 */
async function problem(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');

  try {
    const parsed = JSON.parse(body) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // Not JSON at all. On a static host with no Worker behind it -- the
    // GitHub Pages copy, for instance -- /api/chat is just a missing file,
    // and "404" tells nobody anything useful.
    if (response.status === 404) {
      return 'No companion server is connected to this copy of the app, so nobody can answer yet. Everything else works -- see SETUP.md to run it with your own key.';
    }
  }

  return `The friend could not be reached (${response.status}).`;
}

/** Resolves with the finished reply. Throws if the Worker reports an error. */
export async function streamReply(options: StreamOptions): Promise<string> {
  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: options.signal,
    body: JSON.stringify({ ...options.context, messages: options.messages }),
  });

  if (!response.ok || !response.body) {
    throw new Error(await problem(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let reply = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line. The last piece of the
    // buffer is usually a partial frame, so it stays for the next read.
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const event = /^event: (.+)$/m.exec(frame)?.[1];
      const raw = /^data: (.+)$/m.exec(frame)?.[1];
      if (!event || !raw) continue;

      const payload = JSON.parse(raw) as { text?: string; message?: string };
      if (event === 'chunk' && payload.text) {
        reply += payload.text;
        options.onChunk(reply);
      } else if (event === 'error') {
        throw new Error(payload.message ?? 'The reply stopped partway.');
      }
    }
  }

  return reply;
}
