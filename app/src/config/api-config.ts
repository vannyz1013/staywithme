// Where the Worker lives.
//
// Same origin in production, because the Worker serves the site too. In
// `bun run dev` the Vite proxy forwards /api to :8787, so the same relative
// path works there -- which is why this is a constant and not a setting.

export const CHAT_URL = '/api/chat';
export const REMEMBER_URL = '/api/remember';
