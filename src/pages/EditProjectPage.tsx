import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Skeleton } from '@/components/ui/skeleton'
import { projectToFormValues, updateProject } from '@/lib/projects'
import { useProject } from '@/hooks/useProject'

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { project, loading, error: loadError } = useProject(id)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!id) {
    return null
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  if (!project) {
    return (
      <div className="text-muted-foreground text-sm">
        Projeto não encontrado.{' '}
        <Link className="text-primary underline" to="/">
          Voltar ao início
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        to={`/projects/${id}`}
        className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Voltar ao projeto
      </Link>

      <div>
        <h1 className="text-[#070F26] text-[22px] font-semibold leading-tight tracking-tight md:text-2xl">
          Editar contexto
        </h1>
        <p className="text-[#64748B] mt-2 text-[13px] leading-relaxed">
          Alterações passam a valer nas próximas mensagens com os agentes.
        </p>
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Card className="border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6 sm:p-8">
          <ProjectForm
            key={project.id}
            initial={projectToFormValues(project)}
            submitLabel="Salvar alterações"
            cancelHref={`/projects/${id}`}
            isSubmitting={submitting}
            onSubmitSuccess={async (values) => {
              setSubmitting(true)
              setSaveError(null)
              try {
                await updateProject(id, values)
                navigate(`/projects/${id}`)
              } catch (e: unknown) {
                setSaveError(
                  e instanceof Error ? e.message : 'Erro ao salvar o projeto'
                )
              } finally {
                setSubmitting(false)
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
