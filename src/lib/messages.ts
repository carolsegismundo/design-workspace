import { isDemoMode } from '@/lib/demoMode'
import * as demo from '@/lib/localDemoStore'
import { getSupabase } from '@/lib/supabase/client'
import type { MessageRow } from '@/types/database'

export async function listMessages(threadId: string): Promise<MessageRow[]> {
  if (isDemoMode()) return demo.demoListMessages(threadId)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as MessageRow[]
}

export async function insertMessage(
  threadId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<MessageRow> {
  if (isDemoMode()) return demo.demoInsertMessage(threadId, role, content)

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, role, content })
    .select('*')
    .single()

  if (error) throw error
  if (!data) throw new Error('Mensagem não salva')
  return data as MessageRow
}
