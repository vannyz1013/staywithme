// Build config. app/ is the source, docs/ is what gets deployed --
// the same directory the Cloudflare Worker serves as static assets.
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// app/src/config/supabase.json is git-ignored and holds the project URL and
// the anon key. The anon key is public by design (it ships in the bundle;
// row-level security is what actually guards the data) but a service_role
// key must never get here, so anything that looks like one stops the build.
function supabaseConfig() {
  let cfg = {};
  try {
    cfg = JSON.parse(readFileSync(new URL('./app/src/config/supabase.json', import.meta.url), 'utf8'));
  } catch {
    // Absent is a supported state: the app falls back to a local-only
    // account so you can run it before the Supabase project exists.
    return { url: '', key: '' };
  }
  const url = String(cfg.url || '').trim();
  const key = String(cfg.anonKey || '').trim();
  if (/^sb_secret_/.test(key) || /service_role/.test(key)) {
    throw new Error('supabase.json holds a SECRET key. Use the anon / publishable one.');
  }
  return { url, key };
}

const SB = supabaseConfig();

export default defineConfig({
  root: 'app',
  base: './',
  define: {
    __SUPABASE_URL__: JSON.stringify(SB.url),
    __SUPABASE_ANON_KEY__: JSON.stringify(SB.key),
  },
  server: {
    port: 5173,
    open: false,
    // `bun run dev:api` runs the Worker on 8787. Without this the chat
    // screen has nothing to talk to during development.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    target: ['es2022', 'safari16', 'chrome109', 'firefox115'],
    sourcemap: true,
  },
});
