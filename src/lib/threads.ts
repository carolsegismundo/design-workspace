import { isDemoMode } from '@/lib/demoMode'
import * as demo from '@/lib/localDemoStore'
import { getSupabase } from '@/lib/supabase/client'
import type { AgentType } from '@/types'

export async function getOrCreateThread(
  projectId: string,
  agentType: AgentType
): Promise<string> {
  if (isDemoMode()) return demo.demoGetOrCreateThread(projectId, agentType)

  const supabase = getSupabase()

  const { data: existing, error: findErr } = await supabase
    .from('agent_threads')
    .select('id')
    .eq('project_id', projectId)
    .eq('agent_type', agentType)
    .maybeSingle()

  if (findErr) throw findErr
  if (existing?.id) return existing.id

  const { data: created, error: insErr } = await supabase
    .from('agent_threads')
    .insert({ project_id: projectId, agent_type: agentType })
    .select('id')
    .single()

  if (insErr) throw insErr
  if (!created?.id) throw new Error('Não foi possível criar a thread')
  return created.id
}
