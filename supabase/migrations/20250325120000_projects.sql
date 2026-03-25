-- Design Agent Board — tabela projects (PRD)
-- Execute no SQL Editor do Supabase ou via CLI: supabase db push

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_name text,
  initiative_type text,
  challenge_summary text,
  objective text,
  problem text,
  audience text,
  journey_flow text,
  technical_constraints text,
  business_constraints text,
  deadline text,
  dependencies text,
  expected_metrics text,
  desired_outcome text,
  acceptance_criteria text,
  project_phase text not null default 'discovery',
  additional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_updated_at_idx on public.projects (updated_at desc);

alter table public.projects enable row level security;

-- MVP: acesso público via anon key (substituir por auth + policies por usuário)
create policy "projects_select_anon" on public.projects
  for select using (true);

create policy "projects_insert_anon" on public.projects
  for insert with check (true);

create policy "projects_update_anon" on public.projects
  for update using (true);

create policy "projects_delete_anon" on public.projects
  for delete using (true);

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_projects_updated_at();
