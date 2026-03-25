import { useCallback, useEffect, useState } from 'react'

import { sendChatMessage } from '@/lib/api/chat'
import { formatUserMessageForStorage } from '@/lib/chatAttachments'
import { insertMessage, listMessages } from '@/lib/messages'
import { getOrCreateThread } from '@/lib/threads'
import type { AgentType, Project } from '@/types'
import type { MessageRow } from '@/types/database'
import type { ChatAttachmentPayload } from '@/types/chatAttachments'

export function useChat(
  projectId: string | undefined,
  agentType: AgentType,
  project: Project | null
) {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || !project) {
      setThreadId(null)
      setMessages([])
      setLoading(false)
      return
    }

    const pid = projectId

    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const tid = await getOrCreateThread(pid, agentType)
        if (cancelled) return
        setThreadId(tid)
        const msgs = await listMessages(tid)
        if (cancelled) return
        setMessages(msgs)
      } catch (e: unknown) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : 'Erro ao carregar o chat'
          )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [projectId, agentType, project?.id])

  const send = useCallback(
    async (
      text: string,
      attachments?: ChatAttachmentPayload[]
    ): Promise<boolean> => {
      if (!threadId || !project) return false
      const trimmed = text.trim()
      const atts = attachments ?? []
      if (!trimmed && atts.length === 0) return false

      setSending(true)
      setError(null)
      try {
        const stored = formatUserMessageForStorage(trimmed, atts)
        await insertMessage(threadId, 'user', stored)
        const history = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
        const { message: assistantText } = await sendChatMessage({
          project,
          agentType,
          userMessage: trimmed,
          history,
          attachments: atts.length > 0 ? atts : undefined,
        })
        await insertMessage(threadId, 'assistant', assistantText)
        const msgs = await listMessages(threadId)
        setMessages(msgs)
        return true
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao enviar')
        return false
      } finally {
        setSending(false)
      }
    },
    [threadId, project, agentType, messages]
  )

  return { messages, loading, sending, error, send, threadId }
}
