-- Stay With Me -- database.
-- Paste this whole file into the Supabase SQL editor and run it once. It is
-- safe to re-run: every statement is create-if-not-exists or a policy that
-- gets dropped first.
--
-- Five tables, all scoped to the signed-in user by row-level security. RLS is
-- what actually protects this data: the anon key ships inside the browser
-- bundle and is not a secret, so a missing policy here would mean anyone
-- could read everyone's conversations.
--
-- Everything is keyed by (user_id, character_id) because memory is PER
-- COMPANION. Telling Mira something does not mean Ash knows it, and that
-- separation is a product decision enforced here rather than in the app.

-- Every line of every conversation. -----------------------------------

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  role         text not null check (role in ('user', 'assistant')),
  -- "body", not "text": text is a type name in Postgres and quoting it
  -- everywhere for the rest of the project's life is not worth it.
  body         text not null,
  -- Photos, and frames pulled out of a shared video, as data URLs.
  images       jsonb,
  created_at   timestamptz not null default now()
);

-- The app always reads one person's thread with one companion, oldest first.
create index if not exists messages_thread_idx
  on public.messages (user_id, character_id, created_at);

-- What each companion knows about you. --------------------------------
-- Editable and deletable from the About screen, on purpose: memory you
-- cannot take back is not memory, it is a record being kept on you.

create table if not exists public.memories (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  fact         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists memories_thread_idx
  on public.memories (user_id, character_id, created_at);

-- How each companion has changed by knowing you. ----------------------

create table if not exists public.traits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  trait        text not null,
  created_at   timestamptz not null default now()
);

create index if not exists traits_thread_idx
  on public.traits (user_id, character_id, created_at);

-- The things that happened, as the companion named them. --------------

create table if not exists public.moments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  title        text not null,
  created_at   timestamptz not null default now()
);

create index if not exists moments_thread_idx
  on public.moments (user_id, character_id, created_at);

-- What you changed about a companion. ---------------------------------
-- One row per pair, so the upsert in the app needs the unique constraint.

create table if not exists public.friend_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  name         text,
  gender       text,
  age          text,
  note         text,
  updated_at   timestamptz not null default now(),
  unique (user_id, character_id)
);

-- Row-level security. --------------------------------------------------

alter table public.messages        enable row level security;
alter table public.memories        enable row level security;
alter table public.traits          enable row level security;
alter table public.moments         enable row level security;
alter table public.friend_profiles enable row level security;

drop policy if exists "own messages" on public.messages;
create policy "own messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own memories" on public.memories;
create policy "own memories" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own traits" on public.traits;
create policy "own traits" on public.traits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own moments" on public.moments;
create policy "own moments" on public.moments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own friend profiles" on public.friend_profiles;
create policy "own friend profiles" on public.friend_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
