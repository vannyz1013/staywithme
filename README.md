# Stay With Me

Somewhere to go when the people around you are busy.

Five companions. You pick one, and they are the same one next time — they
remember what you told them, they pick up what was left hanging, and they are
different enough from each other that choosing matters.

This is not an assistant. It never asks how it can help.

```
sign in  ->  pick a companion  ->  talk
                 (five)             |
                                    +-- 💬 talk  💭 vent  💡 advice  👂 listen  🌙 stay
                                    +-- reply streams in, word by word
                                    +-- memory kept per companion, editable by you
                                    +-- they speak first when you go quiet, or come back
```

## Run it

```bash
bun install
bun run dev       # the app, on http://localhost:5173
bun run dev:api   # the Worker, on :8787 -- second terminal
```

Vite proxies `/api` to the Worker, so both halves work from one page. Without
`bun run dev:api`, the app loads and sending fails.

The first run needs no accounts and no keys: with no Supabase project
configured it falls back to a local name-and-PIN account and stores everything
in this browser. For real accounts and real replies, see **SETUP.md** — two
short steps.

## What it does

**Five people, not one model with five names.** Each persona in
`worker/prompt/persona.ts` specifies the same eight things — vocabulary,
sentence length, humour, reaction to bad news, reaction to good news, how they
comfort, how they ask, how they advise. Mira slows down. Ash sends you two
lines and swears. Uncle Lim tells a story and gets out of the way. Luna types
in lowercase at 3am.

**Five modes, one conversation.** Talk, Vent, Advice, Listen, Stay — switching
changes how they are with you, never what they remember, and never starts a
new thread. The mode is applied server-side in `worker/prompt/mode.ts`; each
block also says where its own edge is, so someone who vents and then asks
"what should I do?" gets an answer instead of a policy.

**Memory that is yours.** Kept per companion — telling Mira something does not
mean Ash knows it. Only durable things are saved, never whole conversations.
Everything they know is listed on their About screen, and every line of it can
be corrected or deleted, because memory you cannot take back is not memory.

**They speak first.** After a silence with the chat open, and when you come
back after a day away — usually about the thing that was unfinished. They are
allowed to decide that saying nothing is better, and often do.

**Photos, and video as far as it goes.** Pictures are compressed and sent.
Video cannot be sent to Claude at all — there is no video input — so a clip
becomes three frames pulled out in the browser, and the app says so rather
than pretending it watched it.

**Any language.** The default is to answer in whatever you wrote, mixing
included. Pin one instead if your typing language and your comfort language
are different.

**No points, no levels, no streaks.** Familiarity is what they know about you
and how they have adapted — shown as lists, never as a number to grow.

**Real people.** A "Need a real person?" door on every screen, never raised
mid-conversation. The safety block (`worker/prompt/safety.ts`) handles genuine
distress by staying in the conversation, not by dumping phone numbers and
leaving.

## Scripts

| | |
|---|---|
| `bun run dev` | the app, with hot reload |
| `bun run dev:api` | the Worker, reading `.dev.vars` |
| `bun run build` | builds `app/` into `docs/` |
| `bun run typecheck` | both halves — browser and Worker have separate tsconfigs |
| `bun run deploy` | builds, then ships to Cloudflare |

## Where things are

One job per file.

```
app/src/
  auth/         sign-up, sign-in, sign-out, session, local fallback account
  characters/   the five, display side; profile, resolve, load, save
  chat/         context, window, stream-reply, send-message, read-state,
                reach-out, idle-nudge, history
  memory/       load, save, edit, refresh
  modes/        list, current
  media/        compress-image, video-frames, pick-file
  friendship/   moment, stats, state          (no scores -- see above)
  repo/         supabase-repo, local-repo, types, index
  i18n/         languages, strings, current
  screens/
    chat/       index, session, thread-view, send-flow, silence,
                greet-return, mode-control, speak, help-button
    about/      index, fact-list, moment-list, trait-list, edit-launcher
    login.ts  choose-character.ts
  ui/           bubble, composer, header, card, avatar, typing, toast,
                mode-bar, state-panel, photo-strip, edit-friend,
                real-help, language-picker
  core/         el, router, mount, storage, ids, time

worker/
  index.ts      routes /api/chat, /api/nudge, /api/state, /api/remember
  routes/       chat, nudge, state, remember
  prompt/       persona, voice, continuity, mode, language, safety,
                state, evolution, profile, system
  lib/          anthropic, sse, media, json, cors

supabase/schema.sql   five tables and their row-level security policies
```

The personalities live in `worker/prompt/persona.ts` and never ship to the
browser — `app/src/characters/list.ts` holds only the name, colour and
greeting. The character `id` is the one thing tying the two together, so a new
companion goes in both.

## What it costs

Each message is one call to `claude-opus-5`, plus a small parallel call that
reads the mood, plus a third every eight messages that decides what is worth
remembering. Effort is `low` in `worker/lib/anthropic.ts` — conversation does
not need more, and it keeps replies fast. Raise it there if answers ever feel
shallow.

## One thing this app is not

It is not a therapist, and the companions say so when it matters. It is also
not trying to be the only person you talk to: nothing in the prompt makes
leaving feel like a cost, and if you have people in your life the companions
are glad about it and point you towards them.
