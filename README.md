# Stay With Me

Pick a friend. Say what's actually going on. Get an answer that remembers you.

Five characters with different personalities, each keeping their own memory of
you. Your account and your conversations live in Supabase; the replies come
from Claude through a Cloudflare Worker that holds the API key, so no key ever
reaches the browser.

```
login  ->  choose a friend  ->  chat
              (5 characters)      |
                                  +-- reply streams in from /api/chat
                                  +-- history saved per friend
                                  +-- memory refreshed every 8 messages
```

## Run it

```bash
bun install
bun run dev       # the app, on http://localhost:5173
bun run dev:api   # the Worker, on :8787 -- second terminal
```

Vite proxies `/api` to the Worker, so both halves work from the one page.
Without `bun run dev:api` running, the app loads and the chat screen fails on
send.

The first run needs no accounts and no keys: with no Supabase project
configured the app falls back to a local name-and-PIN account and stores
everything in this browser. To get real accounts, real sync, and real replies,
see **SETUP.md** -- it is two short steps.

## Scripts

| | |
|---|---|
| `bun run dev` | the app, with hot reload |
| `bun run dev:api` | the Worker, reading `.dev.vars` |
| `bun run build` | builds `app/` into `docs/` |
| `bun run typecheck` | both halves -- browser and Worker have separate tsconfigs |
| `bun run deploy` | builds, then ships to Cloudflare |

## Where things are

```
app/src/
  auth/         sign-up, sign-in, sign-out, session, local fallback account
  characters/   the five friends, as the person choosing sees them
  chat/         history, the context window, the SSE reader, one exchange
  memory/       load, save, and the every-8-messages refresh
  repo/         storage -- Supabase or localStorage, same interface
  screens/      login, choose-character, chat
  ui/           bubble, composer, header, card, avatar, typing, toast
  core/         element helper, router, storage, ids, time

worker/
  index.ts      routes /api/chat and /api/remember
  routes/       the two handlers
  prompt/       persona (the five personalities), voice, safety, assembly
  lib/          anthropic client, SSE, JSON, CORS

supabase/schema.sql   two tables and their row-level security policies
```

The personalities live in `worker/prompt/persona.ts` and never ship to the
browser -- `app/src/characters/list.ts` only holds the name, colour and
greeting. The two files are tied together by the character `id` alone, so if
you add a friend, add them to both.

## What it costs

Every message is one call to `claude-opus-5`, and every 8 messages adds a
second, shorter one to update memory. Effort is set to `low` in
`worker/lib/anthropic.ts` -- conversation does not need more, and it keeps
replies fast. Raise it there if answers ever feel shallow.

## One thing this app is not

It is not a therapist, and the friends say so when it matters. If someone is
in trouble the prompt has them stay in the conversation *and* name real help
(Befrienders KL 03-7627 2929, Talian Kasih 15999) once -- see
`worker/prompt/safety.ts`.
