// The Supabase project, injected at build time by vite.config.mjs.
//
// Empty means "no project configured yet" -- a supported state. The app
// falls back to a local-only account and localStorage, so it runs before
// you have created the project. See SETUP.md.

export const SUPABASE_URL = __SUPABASE_URL__;
export const SUPABASE_ANON_KEY = __SUPABASE_ANON_KEY__;

export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
