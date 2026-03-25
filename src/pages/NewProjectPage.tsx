import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { createProject } from '@/lib/projects'

export function NewProjectPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        to="/"
        className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Voltar
      </Link>

      <div>
        <h1 className="text-[#070F26] text-[22px] font-semibold leading-tight tracking-tight md:text-2xl">
          Novo projeto de design
        </h1>
        <p className="text-[#64748B] mt-2 text-[13px] leading-relaxed">
          Preencha o contexto. Os agentes vão herdar essas informações
          automaticamente nas conversas.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-[#E42600]/30 bg-white">
          <AlertCircle />
          <AlertTitle>Não foi possível criar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6 sm:p-8">
          <ProjectForm
            submitLabel="Criar projeto"
            cancelHref="/"
            isSubmitting={submitting}
            onSubmitSuccess={async (values) => {
              setSubmitting(true)
              setError(null)
              try {
                const id = await createProject(values)
                navigate(`/projects/${id}`)
              } catch (e: unknown) {
                const msg =
                  e instanceof Error
                    ? e.message
                    : typeof e === 'object' &&
                        e !== null &&
                        'message' in e &&
                        typeof (e as { message: unknown }).message === 'string'
                      ? (e as { message: string }).message
                      : 'Erro ao criar o projeto'
                setError(msg)
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
