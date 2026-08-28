// The app and the API ship from the same Worker, so same-origin covers the
// deployed case. These headers exist for `bun run dev`, where the page is on
// :5173 and the Worker is on :8787.

const HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};

export function corsHeaders(): Record<string, string> {
  return { ...HEADERS };
}

/** Answers the browser's preflight. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: HEADERS });
}

export function withCors(response: Response): Response {
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(HEADERS)) out.headers.set(k, v);
  return out;
}
