import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { AGENTS } from '@/constants/agents'
import {
  AGENT_HUB_ICONS,
  AGENT_HUB_ICON_SURFACE,
} from '@/constants/agentHubVisual'
import { getPhaseBadgeClass, getPhaseLabel } from '@/constants/phases'
import { formatDateShort } from '@/lib/formatDate'
import { deleteInsight } from '@/lib/insights'
import { deleteProject } from '@/lib/projects'
import { useInsights } from '@/hooks/useInsights'
import { useProject } from '@/hooks/useProject'
import type { ProjectPhase } from '@/types'

function ContextLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </p>
  )
}

function ContextBlock({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  const text = value?.trim() || '—'
  return (
    <div>
      <ContextLabel>{label}</ContextLabel>
      <p className="text-[13px] leading-relaxed text-[#0f172a]">{text}</p>
    </div>
  )
}

export function ProjectHubPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { project, loading, error } = useProject(id)
  const {
    insights,
    loading: insightsLoading,
    error: insightsError,
    refresh: refreshInsights,
  } = useInsights(id)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [insightDeleteOpen, setInsightDeleteOpen] = useState(false)
  const [insightToDelete, setInsightToDelete] = useState<{
    id: string
    label: string | null
  } | null>(null)
  const [deletingInsight, setDeletingInsight] = useState(false)
  const [insightDeleteError, setInsightDeleteError] = useState<string | null>(
    null
  )

  if (!id) return null

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl lg:col-span-1" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-[#E42600]/30 bg-white">
        <AlertCircle />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!project) {
    return (
      <div className="text-[#64748B] text-sm">
        Projeto não encontrado.{' '}
        <Link className="text-primary font-medium underline" to="/">
          Voltar ao painel
        </Link>
      </div>
    )
  }

  const phase = project.project_phase as ProjectPhase

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProject(id)
      setDeleteOpen(false)
      navigate('/', { replace: true })
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteInsight() {
    if (!insightToDelete) return
    setInsightDeleteError(null)
    setDeletingInsight(true)
    try {
      await deleteInsight(insightToDelete.id)
      setInsightDeleteOpen(false)
      setInsightToDelete(null)
      await refreshInsights()
    } catch (e: unknown) {
      setInsightDeleteError(
        e instanceof Error ? e.message : 'Não foi possível excluir'
      )
    } finally {
      setDeletingInsight(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)_minmax(260px,300px)] lg:gap-8 xl:gap-10">
        {/* Coluna contexto — painel tipo “command center” */}
        <aside className="min-w-0 lg:border-slate-200 lg:border-r lg:pr-8">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Painel
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.04]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Projeto
            </p>
            <h1 className="mt-2 text-xl font-bold leading-tight tracking-tight text-[#0f172a] sm:text-2xl">
              {project.name}
            </h1>
            <Badge
              variant="outline"
              className={`mt-4 text-[11px] font-semibold ${getPhaseBadgeClass(phase)}`}
            >
              Fase de {getPhaseLabel(phase)}
            </Badge>
          </div>

          <div className="mt-8 space-y-6">
            <ContextBlock
              label="Cliente / área"
              value={project.client_name}
            />
            <ContextBlock label="Objetivo" value={project.objective} />
            <ContextBlock label="Desafio" value={project.challenge_summary} />
          </div>

          <div className="mt-10 space-y-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-lg border-slate-300 bg-white text-[15px] font-semibold text-[#0f172a] shadow-sm hover:bg-slate-50 hover:text-[#0f172a] [&_svg]:text-slate-700"
              asChild
            >
              <Link to={`/projects/${id}/edit`}>
                <Pencil className="mr-2 size-4" aria-hidden />
                Editar contexto
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
              onClick={() => setDeleteOpen(true)}
            >
              Excluir projeto
            </Button>
          </div>
        </aside>

        {/* Hub central — rolagem única no <main> do AppShell (evita scroll na área cinza) */}
        <section className="min-h-0 min-w-0 lg:pr-1">
          <div className="space-y-10 pb-4">
            {AGENTS.map((agent) => {
              const Icon = AGENT_HUB_ICONS[agent.type]
              return (
                <div key={agent.type} className="space-y-4">
                  <h2 className="text-[15px] font-bold tracking-tight text-[#0f172a]">
                    {agent.hubSectionTitle}
                  </h2>
                  <Link
                    to={`/projects/${id}/agents/${agent.type}`}
                    className="block"
                  >
                    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow transition-colors hover:border-slate-300 hover:shadow-md">
                      <CardHeader className="flex flex-col items-center gap-5 px-8 pb-8 pt-10 text-center">
                        <div
                          className={`flex size-16 items-center justify-center rounded-2xl ${AGENT_HUB_ICON_SURFACE}`}
                        >
                          <Icon
                            className="size-8"
                            strokeWidth={1.4}
                            aria-hidden
                          />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-lg font-bold leading-snug text-[#0f172a]">
                            {agent.name}
                          </CardTitle>
                          <CardDescription className="text-[13px] leading-relaxed text-slate-600">
                            {agent.description}
                          </CardDescription>
                        </div>
                        <span className="text-primary text-sm font-semibold">
                          Iniciar sessão{' '}
                          <ArrowRight
                            className="inline size-4 align-text-bottom"
                            aria-hidden
                          />
                        </span>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* Insights */}
        <aside className="min-w-0 lg:border-slate-200 lg:border-l lg:pl-8">
          <div>
            <h2 className="text-sm font-bold text-[#0f172a]">Insights salvos</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Decisões e ideias importantes.
            </p>
            {insightsLoading && (
              <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
            )}
            {insightsError && (
              <p className="text-[#E42600] mt-3 text-xs">{insightsError}</p>
            )}
            {!insightsLoading &&
              !insightsError &&
              insights.length === 0 && (
                <div className="mt-10 flex flex-col items-center px-2 text-center">
                  <div
                    className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50"
                    aria-hidden
                  >
                    <MessageCircle
                      className="size-8 text-[#CBD5E1]"
                      strokeWidth={1.25}
                    />
                  </div>
                  <p className="text-[#94A3B8] max-w-[220px] text-[13px] leading-relaxed">
                    Nenhum insight salvo ainda. Converse com um agente e marque
                    os pontos importantes.
                  </p>
                </div>
              )}
            {!insightsLoading && !insightsError && insights.length > 0 && (
              <ul className="mt-6 space-y-2">
                {insights.map((i) => (
                  <li
                    key={i.id}
                    className="group rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {i.label && (
                          <p className="font-medium text-[#0f172a]">{i.label}</p>
                        )}
                        <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-slate-600">
                          {i.content}
                        </p>
                        <p className="text-[#94A3B8] mt-2 text-[10px]">
                          {formatDateShort(i.created_at)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-[#94A3B8] shrink-0 opacity-70 hover:bg-red-50 hover:text-[#DC2626] group-hover:opacity-100"
                        title="Excluir insight"
                        onClick={() => {
                          setInsightDeleteError(null)
                          setInsightToDelete({ id: i.id, label: i.label })
                          setInsightDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        <span className="sr-only">Excluir insight</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Excluir projeto?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Mensagens e insights deste
              projeto serão removidos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? 'Excluindo…' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={insightDeleteOpen}
        onOpenChange={(open) => {
          setInsightDeleteOpen(open)
          if (!open) {
            setInsightToDelete(null)
            setInsightDeleteError(null)
          }
        }}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Excluir insight?</DialogTitle>
            <DialogDescription>
              {insightToDelete?.label
                ? `Remover “${insightToDelete.label.slice(0, 80)}${insightToDelete.label.length > 80 ? '…' : ''}” permanente?`
                : 'Este insight será removido permanentemente.'}
            </DialogDescription>
          </DialogHeader>
          {insightDeleteError && (
            <p className="text-destructive text-sm" role="alert">
              {insightDeleteError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setInsightDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              disabled={deletingInsight}
              onClick={() => void handleDeleteInsight()}
            >
              {deletingInsight ? 'Excluindo…' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
