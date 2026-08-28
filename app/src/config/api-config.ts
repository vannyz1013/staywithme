// Where the Worker lives.
//
// Same origin in production, because the Worker serves the site too. In
// `bun run dev` the Vite proxy forwards /api to :8787, so the same relative
// paths work there -- which is why these are constants and not settings.

export const CHAT_URL = '/api/chat';
export const NUDGE_URL = '/api/nudge';
export const STATE_URL = '/api/state';
export const REMEMBER_URL = '/api/remember';
