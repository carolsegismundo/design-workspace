-- Threads, mensagens e insights (PRD)

create table if not exists public.agent_threads (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  agent_type text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, agent_type)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid not null references public.agent_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  message_id uuid references public.messages(id) on delete set null,
  agent_type text,
  content text not null,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_created_idx
  on public.messages (thread_id, created_at asc);

create index if not exists insights_project_created_idx
  on public.insights (project_id, created_at desc);

alter table public.agent_threads enable row level security;
alter table public.messages enable row level security;
alter table public.insights enable row level security;

create policy "agent_threads_select_anon" on public.agent_threads for select using (true);
create policy "agent_threads_insert_anon" on public.agent_threads for insert with check (true);
create policy "agent_threads_update_anon" on public.agent_threads for update using (true);
create policy "agent_threads_delete_anon" on public.agent_threads for delete using (true);

create policy "messages_select_anon" on public.messages for select using (true);
create policy "messages_insert_anon" on public.messages for insert with check (true);
create policy "messages_update_anon" on public.messages for update using (true);
create policy "messages_delete_anon" on public.messages for delete using (true);

create policy "insights_select_anon" on public.insights for select using (true);
create policy "insights_insert_anon" on public.insights for insert with check (true);
create policy "insights_update_anon" on public.insights for update using (true);
create policy "insights_delete_anon" on public.insights for delete using (true);

create or replace function public.set_agent_threads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agent_threads_set_updated_at on public.agent_threads;
create trigger agent_threads_set_updated_at
  before update on public.agent_threads
  for each row
  execute function public.set_agent_threads_updated_at();
