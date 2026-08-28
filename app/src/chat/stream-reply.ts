// Reads the reply off the Worker as it is written.
//
// A plain fetch + ReadableStream rather than EventSource, because
// EventSource cannot POST and the whole conversation has to go up with the
// request.

import { CHAT_URL } from '../config/api-config';
import type { OnChunk, WireMessage } from './types';

export interface StreamOptions {
  characterId: string;
  messages: WireMessage[];
  memory: string[];
  displayName?: string;
  onChunk: OnChunk;
  signal?: AbortSignal;
}

/** Resolves with the finished reply. Throws if the Worker reports an error. */
export async function streamReply(options: StreamOptions): Promise<string> {
  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: options.signal,
    body: JSON.stringify({
      characterId: options.characterId,
      messages: options.messages,
      memory: options.memory,
      displayName: options.displayName,
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `The friend could not be reached (${response.status}).`);
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
