-- Autenticação por usuário: dono do projeto + RLS (substitui policies anon abertas).
-- Aplique no SQL Editor do Supabase ou: supabase db push
--
-- Projetos criados antes desta migração sem user_id ficam invisíveis; apague ou atribua user_id manualmente:
--   delete from public.projects where user_id is null;

alter table public.projects
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Remover dados MVP sem dono (opcional — comente se precisar migrar manualmente)
delete from public.projects where user_id is null;

alter table public.projects
  alter column user_id set not null;

-- Idempotência: remover policies "own" se a migração for reexecutada
drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;
drop policy if exists "agent_threads_select_own" on public.agent_threads;
drop policy if exists "agent_threads_insert_own" on public.agent_threads;
drop policy if exists "agent_threads_update_own" on public.agent_threads;
drop policy if exists "agent_threads_delete_own" on public.agent_threads;
drop policy if exists "messages_select_own" on public.messages;
drop policy if exists "messages_insert_own" on public.messages;
drop policy if exists "messages_update_own" on public.messages;
drop policy if exists "messages_delete_own" on public.messages;
drop policy if exists "insights_select_own" on public.insights;
drop policy if exists "insights_insert_own" on public.insights;
drop policy if exists "insights_update_own" on public.insights;
drop policy if exists "insights_delete_own" on public.insights;

-- Policies antigas (acesso anon total)
drop policy if exists "projects_select_anon" on public.projects;
drop policy if exists "projects_insert_anon" on public.projects;
drop policy if exists "projects_update_anon" on public.projects;
drop policy if exists "projects_delete_anon" on public.projects;

drop policy if exists "agent_threads_select_anon" on public.agent_threads;
drop policy if exists "agent_threads_insert_anon" on public.agent_threads;
drop policy if exists "agent_threads_update_anon" on public.agent_threads;
drop policy if exists "agent_threads_delete_anon" on public.agent_threads;

drop policy if exists "messages_select_anon" on public.messages;
drop policy if exists "messages_insert_anon" on public.messages;
drop policy if exists "messages_update_anon" on public.messages;
drop policy if exists "messages_delete_anon" on public.messages;

drop policy if exists "insights_select_anon" on public.insights;
drop policy if exists "insights_insert_anon" on public.insights;
drop policy if exists "insights_update_anon" on public.insights;
drop policy if exists "insights_delete_anon" on public.insights;

-- projects: só o dono
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- agent_threads: via projeto do usuário
create policy "agent_threads_select_own" on public.agent_threads
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = agent_threads.project_id and p.user_id = auth.uid()
    )
  );

create policy "agent_threads_insert_own" on public.agent_threads
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "agent_threads_update_own" on public.agent_threads
  for update using (
    exists (
      select 1 from public.projects p
      where p.id = agent_threads.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "agent_threads_delete_own" on public.agent_threads
  for delete using (
    exists (
      select 1 from public.projects p
      where p.id = agent_threads.project_id and p.user_id = auth.uid()
    )
  );

-- messages: via thread → projeto
create policy "messages_select_own" on public.messages
  for select using (
    exists (
      select 1
      from public.agent_threads t
      join public.projects p on p.id = t.project_id
      where t.id = messages.thread_id and p.user_id = auth.uid()
    )
  );

create policy "messages_insert_own" on public.messages
  for insert with check (
    exists (
      select 1
      from public.agent_threads t
      join public.projects p on p.id = t.project_id
      where t.id = thread_id and p.user_id = auth.uid()
    )
  );

create policy "messages_update_own" on public.messages
  for update using (
    exists (
      select 1
      from public.agent_threads t
      join public.projects p on p.id = t.project_id
      where t.id = messages.thread_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.agent_threads t
      join public.projects p on p.id = t.project_id
      where t.id = thread_id and p.user_id = auth.uid()
    )
  );

create policy "messages_delete_own" on public.messages
  for delete using (
    exists (
      select 1
      from public.agent_threads t
      join public.projects p on p.id = t.project_id
      where t.id = messages.thread_id and p.user_id = auth.uid()
    )
  );

-- insights: via projeto
create policy "insights_select_own" on public.insights
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = insights.project_id and p.user_id = auth.uid()
    )
  );

create policy "insights_insert_own" on public.insights
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "insights_update_own" on public.insights
  for update using (
    exists (
      select 1 from public.projects p
      where p.id = insights.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "insights_delete_own" on public.insights
  for delete using (
    exists (
      select 1 from public.projects p
      where p.id = insights.project_id and p.user_id = auth.uid()
    )
  );
