-- Stay With Me -- database.
-- Paste this whole file into the Supabase SQL editor and run it once.
--
-- Two tables. Both are scoped to the signed-in user by row-level security,
-- which is what actually protects the data: the anon key ships in the
-- browser bundle and is not a secret, so a missing policy here would mean
-- anyone could read everyone's conversations.

-- Every line of every conversation. -----------------------------------

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  role        text not null check (role in ('user', 'assistant')),
  -- "body", not "text": text is a type name in Postgres and quoting it
  -- everywhere for the rest of the project's life is not worth it.
  body        text not null,
  created_at  timestamptz not null default now()
);

-- The app always reads one person's thread with one friend, oldest first.
create index if not exists messages_thread_idx
  on public.messages (user_id, character_id, created_at);

-- What each friend has learned about you. -----------------------------

create table if not exists public.memories (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  fact         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists memories_thread_idx
  on public.memories (user_id, character_id, created_at);

-- Row-level security. --------------------------------------------------
-- Memory is per friend on purpose: telling Mira something does not mean
-- Ash knows it, which is how it works with people.

alter table public.messages enable row level security;
alter table public.memories enable row level security;

drop policy if exists "own messages" on public.messages;
create policy "own messages" on public.messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own memories" on public.memories;
create policy "own memories" on public.memories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
