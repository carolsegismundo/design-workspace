import { isDemoMode } from '@/lib/demoMode'
import * as demo from '@/lib/localDemoStore'
import { getSupabase } from '@/lib/supabase/client'
import type { AgentType } from '@/types'
import type { InsightRow } from '@/types/database'

export async function listInsights(projectId: string): Promise<InsightRow[]> {
  if (isDemoMode()) return demo.demoListInsights(projectId)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as InsightRow[]
}

export async function deleteInsight(insightId: string): Promise<void> {
  if (isDemoMode()) {
    await demo.demoDeleteInsight(insightId)
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.from('insights').delete().eq('id', insightId)
  if (error) throw error
}

export async function createInsight(
  projectId: string,
  payload: {
    content: string
    agent_type?: AgentType
    message_id?: string | null
    label?: string | null
  }
): Promise<void> {
  if (isDemoMode()) {
    await demo.demoCreateInsight(projectId, payload)
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.from('insights').insert({
    project_id: projectId,
    content: payload.content,
    agent_type: payload.agent_type ?? null,
    message_id: payload.message_id ?? null,
    label: payload.label ?? null,
  })
  if (error) throw error
}
