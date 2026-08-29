# Setup

Two things to configure. The app runs without either, in a reduced form, so
do them in whatever order suits you.

---

## 1. A model key -- makes the companions reply

Without this, the chat screen loads and sending shows an explanation.

### Gemini (free, recommended)

Get a key at <https://aistudio.google.com/apikey>. Sign in with Google, click
Create API key. **No credit card.** It is a permanent free tier, not a trial.

Two things about it that are true and worth knowing:

- Google **uses free-tier conversations to improve their models**. For your own
  testing that is your choice to make; if other people ever use your copy, they
  cannot consent to something they do not know, so tell them or move to the
  paid tier (where Google does not train on it).
- There are per-minute and per-day request limits. Hitting one returns an
  error, never a charge.

### Claude (optional, better, costs money)

If you have an Anthropic key it will be used instead -- set
`ANTHROPIC_API_KEY` and leave `GEMINI_API_KEY` unset. Replies are noticeably
sharper, especially in Vent and Listen where nuance matters. Roughly USD $0.02
per message at the current settings.

**Note that a ChatGPT or Claude subscription does not work here.** Chat
subscriptions and the API are separate products; a subscription gives you no
API key.

### For local development

```bash
cp .dev.vars.example .dev.vars
```

Open `.dev.vars`, paste your key, save. The file is git-ignored.

### For the deployed Worker

```bash
bunx wrangler login                      # once, opens a browser
bunx wrangler secret put GEMINI_API_KEY  # paste when prompted
```

The key lives on Cloudflare from then on -- never in the repo, never in the
browser bundle. That is the whole reason the Worker exists.

Check it landed:

```bash
curl https://staywithme.<your-subdomain>.workers.dev/api/health
# {"ok":true,"key":true,"model":"gemini"}
```

---

## 2. Supabase -- makes accounts and history real

Without this, the app uses a name-and-PIN account stored in the browser, and
your conversations live on one device only.

1. Create a free project at <https://supabase.com/dashboard>.
2. Open the **SQL editor**, paste all of `supabase/schema.sql`, and run it.
   That creates the two tables and their row-level security policies.
3. In **Project Settings -> API**, copy the project URL and the **anon**
   (publishable) key.
4. Create `app/src/config/supabase.json`:

```json
{
  "url": "https://abcdefgh.supabase.co",
  "anonKey": "eyJhbGciOi..."
}
```

That file is git-ignored and is read at build time. The anon key is public by
design -- it ships in the bundle, and the RLS policies from step 2 are what
actually guard the data. A `service_role` key must never go in there; the
build refuses to run if it sees one.

5. Restart `bun run dev`. The login screen switches from PIN to email and
   password.

**Email confirmation.** New Supabase projects require it by default, so the
first sign-up says "check your email" rather than signing you straight in. To
turn it off while testing: Authentication -> Providers -> Email -> uncheck
*Confirm email*.

---

## 3. Deploy

```bash
bun run deploy
```

Builds `app/` into `docs/` and ships both the site and the Worker. The first
deploy will ask to create the `staywithme` Worker on your account.

`docs/` is build output and is git-ignored. If you would rather host the front
end on GitHub Pages, remove `docs/` from `.gitignore` and commit it -- but the
API routes only exist on the Worker, so that copy would also need
`app/src/config/api-config.ts` pointed at the Worker's full URL.
