// JSON request/response plumbing, so no route has to repeat it.

export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function fail(message: string, status = 400): Response {
  return json({ error: message }, status);
}

/** Parses a JSON body, returning null rather than throwing on junk. */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
