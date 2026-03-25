import type { AgentType, Project } from '@/types'
import type { ChatAttachmentPayload } from '@/types/chatAttachments'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

export async function sendChatMessage(body: {
  project: Project
  agentType: AgentType
  userMessage: string
  history: { role: 'user' | 'assistant'; content: string }[]
  attachments?: ChatAttachmentPayload[]
}): Promise<{ message: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const json = (await res.json().catch(() => ({}))) as { message?: string }

  if (!res.ok) {
    let msg = json.message ?? res.statusText
    const upstream = res.headers.get('X-Chat-API')
    if (/anthropic/i.test(msg)) {
      msg =
        'Outro programa na mesma porta da API devolveu erro antigo (Anthropic). Este app usa Gemini na porta definida por CHAT_API_PORT (padrão 3002). Pare todos os Node, confirme no .env CHAT_API_PORT=3002, rode `npm run dev` e abra `/api/health` — deve aparecer "chatApi":"design-agent-board-gemini".'
    } else if (upstream && upstream !== 'design-agent-board-gemini') {
      msg = `${msg} (API inesperada: ${upstream})`
    }
    throw new Error(msg)
  }

  return { message: json.message ?? '' }
}
