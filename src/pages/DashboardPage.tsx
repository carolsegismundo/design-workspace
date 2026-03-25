import { AlertCircle, Building2, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getPhaseBadgeClass, getPhaseLabel, getPhaseStripeClass } from '@/constants/phases'
import { formatDateShort } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import { useProjectsList } from '@/hooks/useProjectsList'
import type { ProjectPhase } from '@/types'

export function DashboardPage() {
  const { projects, loading, error } = useProjectsList()

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="space-y-3 border-b border-slate-200/80 pb-6">
        <h1 className="text-xl font-semibold tracking-tight text-[#0f172a] md:text-[1.35rem]">
          Projetos
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600">
          Gerencie suas iniciativas de design e contextos. Para criar projeto, use o
          botão &quot;+&quot; ao lado de Projetos na barra lateral.
        </p>
      </header>

      {error && (
        <Alert
          variant="destructive"
          className="border-[#E42600]/30 bg-white"
        >
          <AlertCircle className="text-[#E42600]" />
          <AlertTitle>Erro ao carregar projetos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-lg border border-slate-200/90" />
          <Skeleton className="h-36 rounded-lg border border-slate-200/90" />
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            Nenhum projeto ainda
          </h2>
          <p className="mb-6 max-w-[min(100%,24rem)] text-[15px] leading-relaxed text-slate-600">
            Use o botão <strong className="font-semibold text-slate-800">+</strong>{' '}
            ao lado de &quot;Projetos&quot; na barra lateral para criar o primeiro
            projeto com contexto para os agentes.
          </p>
          <Button
            asChild
            className="h-10 rounded-md bg-primary px-5 font-semibold text-primary-foreground shadow-sm hover:bg-primary-dark"
          >
            <Link to="/projects/new">Criar primeiro projeto</Link>
          </Button>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => {
            const phase = p.project_phase as ProjectPhase
            return (
              <li key={p.id}>
                <Link to={`/projects/${p.id}`} className="group block h-full">
                  <div
                    className={cn(
                      'flex h-full min-h-[128px] overflow-hidden rounded-lg border border-slate-200/90 bg-white',
                      'shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow]',
                      'hover:border-slate-300 hover:shadow-md'
                    )}
                  >
                    <div
                      className={cn(
                        'w-[3px] shrink-0 self-stretch',
                        getPhaseStripeClass(phase)
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="line-clamp-2 min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-tight text-[#0f172a] group-hover:text-primary">
                          {p.name}
                        </h2>
                        <Badge
                          variant="outline"
                          className={cn(
                            'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold',
                            getPhaseBadgeClass(phase)
                          )}
                        >
                          {getPhaseLabel(phase)}
                        </Badge>
                      </div>
                      <div className="my-3 border-t border-slate-100" />
                      {p.client_name ? (
                        <p className="flex items-center gap-2 text-[13px] leading-normal text-slate-600">
                          <Building2
                            className="size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                          <span>{p.client_name}</span>
                        </p>
                      ) : (
                        <p className="text-[13px] italic text-slate-400">
                          Cliente / área não informado
                        </p>
                      )}
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="size-3.5 shrink-0" aria-hidden />
                        <span>Atualizado em {formatDateShort(p.updated_at)}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
