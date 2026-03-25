import { AlertCircle, ChevronRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { ChatWindow } from '@/components/agents/ChatWindow'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AGENTS } from '@/constants/agents'
import { useChat } from '@/hooks/useChat'
import { useProject } from '@/hooks/useProject'
import type { AgentType } from '@/types'

const VALID_AGENT_TYPES: AgentType[] = ['discovery', 'ux_writing', 'metrics']

export function AgentChatPage() {
  const { id, agentType } = useParams<{ id: string; agentType: string }>()
  const { project, loading: projectLoading, error: projectError } =
    useProject(id)

  const typedAgent = (agentType ?? '') as AgentType
  const {
    messages,
    loading: chatLoading,
    sending,
    error: chatError,
    send,
  } = useChat(id, typedAgent, project)

  if (!id || !agentType) return null

  const isValid = VALID_AGENT_TYPES.includes(typedAgent)
  if (!isValid) {
    return <Navigate to={`/projects/${id}`} replace />
  }

  if (projectLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  if (projectError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{projectError}</AlertDescription>
      </Alert>
    )
  }

  const agent = AGENTS.find((a) => a.type === agentType)

  if (!project || !agent) {
    return (
      <div className="text-muted-foreground text-sm">
        Projeto não encontrado.{' '}
        <Link className="text-primary underline" to="/">
          Voltar
        </Link>
      </div>
    )
  }

  const objective = project.objective?.trim()
  const challenge =
    project.challenge_summary?.trim() || project.problem?.trim()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6">
      <nav
        className="text-[#64748B] flex flex-wrap items-center gap-1 text-[13px]"
        aria-label="Navegação"
      >
        <Link className="hover:text-primary" to="/">
          Início
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
        <Link className="hover:text-primary" to={`/projects/${id}`}>
          {project.name}
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
        <span className="text-[#070F26] font-semibold">{agent.name}</span>
      </nav>

      <header className="space-y-1">
        <p className="text-[#64748B] text-[11px] font-semibold uppercase tracking-[0.08em]">
          {agent.hubSectionTitle}
        </p>
        <h1 className="text-[#070F26] text-[22px] font-semibold leading-tight tracking-tight">
          {agent.name}
        </h1>
        <p className="text-[#64748B] text-[13px] leading-relaxed">
          {agent.description}
        </p>
      </header>

      <div className="border-[#E5E7EB] rounded-xl border bg-[#F8F9FA] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
        <p className="text-[#64748B] mb-3 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Contexto injetado
        </p>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
          <div>
            <p className="text-[#64748B] mb-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
              Objetivo
            </p>
            <p className="text-[#0F172A] text-[13px] leading-relaxed">
              {objective || '—'}
            </p>
          </div>
          <div>
            <p className="text-[#64748B] mb-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
              Desafio
            </p>
            <p className="text-[#0F172A] text-[13px] leading-relaxed">
              {challenge || '—'}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-[#E5E7EB]" />

      {chatLoading ? (
        <Skeleton className="h-[min(70vh,560px)] min-h-[420px] w-full rounded-xl" />
      ) : (
        <ChatWindow
          messages={messages}
          sending={sending}
          error={chatError}
          onSend={send}
          projectId={id}
          agentType={typedAgent}
          inputPlaceholder={`Pergunte ao ${agent.name}…`}
        />
      )}

      <div className="flex justify-start">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-[#E5E7EB] text-[#334155] hover:bg-[#F8FAFC] hover:text-primary-dark"
          asChild
        >
          <Link to={`/projects/${id}`}>Voltar ao hub</Link>
        </Button>
      </div>
    </div>
  )
}
