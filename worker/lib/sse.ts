// Server-sent events. The reply arrives a few words at a time instead of
// landing as a finished paragraph -- which is most of why the chat feels
// like a person typing rather than a form submitting.

import { corsHeaders } from './cors';

const encoder = new TextEncoder();

function frame(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Turns an async iterable of text pieces into a streaming Response.
 * Emits `chunk` per piece, then `done`, or `error` if the source throws
 * partway through (the browser has already painted text by then, so the
 * failure has to be reported in-band rather than as an HTTP status).
 */
export function streamText(source: AsyncIterable<string>): Response {
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const piece of source) {
          if (piece) controller.enqueue(frame('chunk', { text: piece }));
        }
        controller.enqueue(frame('done', {}));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(frame('error', { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      ...corsHeaders(),
    },
  });
}
