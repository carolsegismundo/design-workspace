/**
 * Persistência em localStorage quando não há Supabase (modo demo).
 * Prefixo dab_demo_v1_
 */
import type { ProjectFormValues } from '@/components/projects/ProjectForm'
import type { AgentType, Project, ProjectPhase } from '@/types'
import type { AgentThread, InsightRow, MessageRow } from '@/types/database'

const K_PROJECTS = 'dab_demo_v1_projects'
const K_THREADS = 'dab_demo_v1_threads'
const K_MESSAGES = 'dab_demo_v1_messages'
const K_INSIGHTS = 'dab_demo_v1_insights'

function nullIfEmpty(s: string): string | null {
  const t = s.trim()
  return t === '' ? null : t
}

function nowIso() {
  return new Date().toISOString()
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function formToProject(id: string, values: ProjectFormValues): Project {
  const t = nowIso()
  return {
    id,
    user_id: crypto.randomUUID(),
    name: values.name.trim(),
    client_name: nullIfEmpty(values.client_name),
    initiative_type: values.initiative_type || null,
    challenge_summary: nullIfEmpty(values.challenge_summary),
    objective: nullIfEmpty(values.objective),
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
    project_phase: values.project_phase as ProjectPhase,
    additional_notes: null,
    created_at: t,
    updated_at: t,
  }
}

export async function demoFetchProjectsList(): Promise<
  Pick<
    Project,
    'id' | 'name' | 'client_name' | 'project_phase' | 'updated_at'
  >[]
> {
  const projects = readJson<Project[]>(K_PROJECTS, [])
  return [...projects]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      client_name: p.client_name,
      project_phase: p.project_phase,
      updated_at: p.updated_at,
    }))
}

export async function demoFetchProjectById(id: string): Promise<Project | null> {
  const projects = readJson<Project[]>(K_PROJECTS, [])
  return projects.find((p) => p.id === id) ?? null
}

export async function demoCreateProject(values: ProjectFormValues): Promise<string> {
  const id = crypto.randomUUID()
  const projects = readJson<Project[]>(K_PROJECTS, [])
  projects.push(formToProject(id, values))
  writeJson(K_PROJECTS, projects)
  return id
}

export async function demoUpdateProject(
  id: string,
  values: ProjectFormValues
): Promise<void> {
  const projects = readJson<Project[]>(K_PROJECTS, [])
  const i = projects.findIndex((p) => p.id === id)
  if (i === -1) throw new Error('Projeto não encontrado')
  const prev = projects[i]
  const t = nowIso()
  projects[i] = {
    ...prev,
    name: values.name.trim(),
    client_name: nullIfEmpty(values.client_name),
    initiative_type: values.initiative_type || null,
    challenge_summary: nullIfEmpty(values.challenge_summary),
    objective: nullIfEmpty(values.objective),
    project_phase: values.project_phase as ProjectPhase,
    updated_at: t,
  }
  writeJson(K_PROJECTS, projects)
}

export async function demoDeleteProject(id: string): Promise<void> {
  const projects = readJson<Project[]>(K_PROJECTS, [])
  const next = projects.filter((p) => p.id !== id)
  if (next.length === projects.length) {
    throw new Error('Projeto não encontrado')
  }
  writeJson(K_PROJECTS, next)

  const threads = readJson<AgentThread[]>(K_THREADS, [])
  const threadIds = threads
    .filter((t) => t.project_id === id)
    .map((t) => t.id)
  writeJson(
    K_THREADS,
    threads.filter((t) => t.project_id !== id)
  )

  const messages = readJson<MessageRow[]>(K_MESSAGES, [])
  writeJson(
    K_MESSAGES,
    messages.filter((m) => !threadIds.includes(m.thread_id))
  )

  const insights = readJson<InsightRow[]>(K_INSIGHTS, [])
  writeJson(
    K_INSIGHTS,
    insights.filter((i) => i.project_id !== id)
  )
}

export async function demoGetOrCreateThread(
  projectId: string,
  agentType: AgentType
): Promise<string> {
  const threads = readJson<AgentThread[]>(K_THREADS, [])
  const found = threads.find(
    (x) => x.project_id === projectId && x.agent_type === agentType
  )
  if (found) return found.id

  const id = crypto.randomUUID()
  const t = nowIso()
  threads.push({
    id,
    project_id: projectId,
    agent_type: agentType,
    title: null,
    created_at: t,
    updated_at: t,
  })
  writeJson(K_THREADS, threads)
  return id
}

export async function demoListMessages(threadId: string): Promise<MessageRow[]> {
  const messages = readJson<MessageRow[]>(K_MESSAGES, [])
  return messages
    .filter((m) => m.thread_id === threadId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
}

export async function demoInsertMessage(
  threadId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<MessageRow> {
  const messages = readJson<MessageRow[]>(K_MESSAGES, [])
  const row: MessageRow = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    role,
    content,
    created_at: nowIso(),
  }
  messages.push(row)
  writeJson(K_MESSAGES, messages)
  return row
}

export async function demoListInsights(projectId: string): Promise<InsightRow[]> {
  const insights = readJson<InsightRow[]>(K_INSIGHTS, [])
  return insights
    .filter((i) => i.project_id === projectId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}

export async function demoCreateInsight(
  projectId: string,
  payload: {
    content: string
    agent_type?: AgentType
    message_id?: string | null
    label?: string | null
  }
): Promise<void> {
  const insights = readJson<InsightRow[]>(K_INSIGHTS, [])
  const row: InsightRow = {
    id: crypto.randomUUID(),
    project_id: projectId,
    message_id: payload.message_id ?? null,
    agent_type: payload.agent_type ?? null,
    content: payload.content,
    label: payload.label ?? null,
    created_at: nowIso(),
  }
  insights.push(row)
  writeJson(K_INSIGHTS, insights)
}

export async function demoDeleteInsight(insightId: string): Promise<void> {
  const insights = readJson<InsightRow[]>(K_INSIGHTS, [])
  const next = insights.filter((i) => i.id !== insightId)
  if (next.length === insights.length) {
    throw new Error('Insight não encontrado')
  }
  writeJson(K_INSIGHTS, next)
}
