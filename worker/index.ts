// The Worker's front door. Static files (docs/) are served by Cloudflare
// before this runs -- see run_worker_first in wrangler.jsonc -- so everything
// arriving here is an API call.

import { handleChat } from './routes/chat';
import { handleNudge } from './routes/nudge';
import { handleRemember } from './routes/remember';
import { handleState } from './routes/state';
import { fail, json } from './lib/json';
import { configuredProvider } from './lib/model';
import { preflight, withCors } from './lib/cors';
import type { Env } from './types';

const ROUTES: Record<string, (request: Request, env: Env) => Promise<Response>> = {
  '/api/chat': handleChat,
  '/api/nudge': handleNudge,
  '/api/state': handleState,
  '/api/remember': handleRemember,
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return preflight();

    const { pathname } = new URL(request.url);

    if (pathname === '/api/health') {
      const model = configuredProvider(env);
      return withCors(json({ ok: true, key: model !== null, model }));
    }

    const route = ROUTES[pathname];
    if (!route) return withCors(fail('Not found.', 404));
    if (request.method !== 'POST') return withCors(fail('Use POST.', 405));

    try {
      // handleChat returns a streaming Response that already carries CORS
      // headers; withCors is a harmless re-set on it and matters for the rest.
      return withCors(await route(request, env));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      return withCors(fail(message, 500));
    }
  },
};
