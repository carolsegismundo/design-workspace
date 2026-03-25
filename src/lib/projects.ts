import type { ProjectFormValues } from '@/components/projects/ProjectForm'
import { isDemoMode } from '@/lib/demoMode'
import * as demo from '@/lib/localDemoStore'
import { getSupabase } from '@/lib/supabase/client'
import type { InitiativeType, Project, ProjectPhase } from '@/types'
import type { Database } from '@/types/database'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

/** Postgrest/Supabase nem sempre devolve `Error`; extrai mensagem legível. */
function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  return 'Erro desconhecido'
}

function mapProjectInsertError(e: unknown): Error {
  const raw = errMsg(e)
  const lower = raw.toLowerCase()
  if (
    lower.includes('row-level security') ||
    lower.includes('rls') ||
    (typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code: string }).code === '42501')
  ) {
    return new Error(
      'Permissão negada ao criar o projeto. Confirme que está logado e que a migração com RLS e user_id foi aplicada no Supabase (SQL Editor).'
    )
  }
  if (lower.includes('user_id') && lower.includes('column')) {
    return new Error(
      'Falta a coluna user_id na tabela projects. Execute a migração supabase/migrations/20250326120000_auth_rls.sql no painel Supabase.'
    )
  }
  return new Error(raw)
}

function nullIfEmpty(s: string): string | null {
  const t = s.trim()
  return t === '' ? null : t
}

export function projectToFormValues(row: Project): ProjectFormValues {
  return {
    name: row.name,
    client_name: row.client_name ?? '',
    initiative_type: (row.initiative_type as InitiativeType | null) ?? '',
    challenge_summary: row.challenge_summary ?? '',
    objective: row.objective ?? '',
    project_phase: row.project_phase as ProjectPhase,
  }
}

function formValuesToInsert(
  values: ProjectFormValues
): Omit<ProjectInsert, 'user_id'> {
  return {
    name: values.name.trim(),
    client_name: nullIfEmpty(values.client_name),
    initiative_type: values.initiative_type || null,
    challenge_summary: nullIfEmpty(values.challenge_summary),
    objective: nullIfEmpty(values.objective),
    project_phase: values.project_phase,
    problem: null,
    audience: null,
    journey_flow: null,
    technical_constraints: null,
    business_constraints: null,
    deadline: null,
    dependencies: null,
    expected_metrics: null,
    desired_outcome: null,
    acceptance_criteria: null,
    additional_notes: null,
  }
}

function formValuesToUpdate(values: ProjectFormValues): ProjectUpdate {
  return {
    name: values.name.trim(),
    client_name: nullIfEmpty(values.client_name),
    initiative_type: values.initiative_type || null,
    challenge_summary: nullIfEmpty(values.challenge_summary),
    objective: nullIfEmpty(values.objective),
    project_phase: values.project_phase,
  }
}

export async function fetchProjectsList(): Promise<
  Pick<
    Project,
    'id' | 'name' | 'client_name' | 'project_phase' | 'updated_at'
  >[]
> {
  if (isDemoMode()) return demo.demoFetchProjectsList()

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, client_name, project_phase, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  if (isDemoMode()) return demo.demoFetchProjectById(id)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Project | null
}

export async function createProject(values: ProjectFormValues): Promise<string> {
  if (isDemoMode()) return demo.demoCreateProject(values)

  const supabase = getSupabase()
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession()

  if (sessionErr) {
    throw new Error(`Sessão: ${sessionErr.message}`)
  }
  if (!session?.user) {
    throw new Error(
      'Sessão inválida. Entre de novo — ou confirme o e-mail se o Supabase exigir confirmação antes do primeiro acesso.'
    )
  }

  const row: ProjectInsert = {
    ...formValuesToInsert(values),
    user_id: session.user.id,
  }
  const { data, error } = await supabase
    .from('projects')
    .insert(row)
    .select('id')
    .single()

  if (error) {
    throw mapProjectInsertError(error)
  }
  if (!data) throw new Error('Projeto criado sem id')
  return data.id
}

export async function updateProject(
  id: string,
  values: ProjectFormValues
): Promise<void> {
  if (isDemoMode()) return demo.demoUpdateProject(id, values)

  const supabase = getSupabase()
  const patch = formValuesToUpdate(values)
  const { error } = await supabase.from('projects').update(patch).eq('id', id)

  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  if (isDemoMode()) return demo.demoDeleteProject(id)

  const supabase = getSupabase()
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) throw error
}
