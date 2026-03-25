import { BookmarkPlus } from 'lucide-react'
import { useState } from 'react'
import Markdown from 'react-markdown'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createInsight } from '@/lib/insights'
import { cn } from '@/lib/utils'
import type { AgentType } from '@/types'

interface MessageBubbleProps {
  id: string
  role: string
  content: string
  created_at: string
  projectId: string
  agentType: AgentType
  onInsightSaved?: () => void
}

export function MessageBubble({
  id,
  role,
  content,
  created_at,
  projectId,
  agentType,
  onInsightSaved,
}: MessageBubbleProps) {
  const isAssistant = role === 'assistant'
  const [dialogOpen, setDialogOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)

  const time = new Date(created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  async function handleSaveInsight() {
    setSaving(true)
    try {
      await createInsight(projectId, {
        content,
        agent_type: agentType,
        message_id: id,
        label: label.trim() || null,
      })
      setDialogOpen(false)
      setLabel('')
      onInsightSaved?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'flex max-w-[min(100%,42rem)] flex-col gap-1 rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed',
          isAssistant
            ? 'border-[#E5E7EB] bg-white self-start border shadow-sm'
            : 'self-end bg-primary text-primary-foreground shadow-sm'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-2 text-xs',
            isAssistant ? 'text-[#64748B]' : 'text-white/90'
          )}
        >
          <span>{isAssistant ? 'Agente' : 'Você'}</span>
          <span className={cn(!isAssistant && 'text-white/85')}>
            {time}
          </span>
        </div>
        {isAssistant ? (
          <div className="text-foreground max-w-none [&_a]:underline [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4">
            <Markdown
              components={{
                p: ({ children }) => <p className="my-1.5">{children}</p>,
                ul: ({ children }) => <ul className="my-2 list-disc pl-4">{children}</ul>,
                ol: ({ children }) => (
                  <ol className="my-2 list-decimal pl-4">{children}</ol>
                ),
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {content}
            </Markdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
        {isAssistant && (
          <div className="mt-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground h-7"
              onClick={() => setDialogOpen(true)}
            >
              <BookmarkPlus className="size-3.5" />
              Salvar insight
            </Button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Salvar insight</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="insight-label">Rótulo (opcional)</Label>
            <Input
              id="insight-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: Hipótese principal"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveInsight()}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
