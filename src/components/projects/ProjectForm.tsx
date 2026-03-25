import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { INITIATIVE_OPTIONS } from '@/constants/initiatives'
import { PROJECT_PHASES } from '@/constants/phases'
import type { InitiativeType, ProjectPhase } from '@/types'

export interface ProjectFormValues {
  name: string
  client_name: string
  initiative_type: InitiativeType | ''
  challenge_summary: string
  objective: string
  project_phase: ProjectPhase
}

const defaultValues: ProjectFormValues = {
  name: '',
  client_name: '',
  initiative_type: '',
  challenge_summary: '',
  objective: '',
  project_phase: 'discovery',
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-[#64748B] text-[11px] font-semibold tracking-[0.06em] uppercase"
    >
      {children}
    </Label>
  )
}

interface ProjectFormProps {
  initial?: Partial<ProjectFormValues>
  submitLabel: string
  cancelHref: string
  isSubmitting?: boolean
  onSubmitSuccess: (values: ProjectFormValues) => void | Promise<void>
}

export function ProjectForm({
  initial,
  submitLabel,
  cancelHref,
  isSubmitting = false,
  onSubmitSuccess,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>({
    ...defaultValues,
    ...initial,
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.name.trim() || isSubmitting) return
    await Promise.resolve(onSubmitSuccess(values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-[#070F26] text-sm font-semibold tracking-wide uppercase">
            Geral
          </h2>
          <p className="text-[#64748B] mt-1 text-[13px] leading-relaxed">
            Identificação do projeto e tipo de iniciativa.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="name">Nome do projeto *</FieldLabel>
            <Input
              id="name"
              name="name"
              required
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
              placeholder="Ex.: Checkout B2B"
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="client_name">Cliente / área</FieldLabel>
              <Input
                id="client_name"
                name="client_name"
                value={values.client_name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, client_name: e.target.value }))
                }
                placeholder="Time ou cliente"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <FieldLabel htmlFor="phase">Fase atual</FieldLabel>
              <Select
                value={values.project_phase}
                onValueChange={(v: ProjectPhase) =>
                  setValues((s) => ({ ...s, project_phase: v }))
                }
              >
                <SelectTrigger
                  id="phase"
                  className="w-full min-w-0 rounded-xl"
                  size="default"
                >
                  <SelectValue placeholder="Selecione a fase" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="w-[var(--radix-select-trigger-width)]"
                >
                  {PROJECT_PHASES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="initiative">Tipo de iniciativa</FieldLabel>
            <Select
              value={values.initiative_type || undefined}
              onValueChange={(v: InitiativeType) =>
                setValues((s) => ({ ...s, initiative_type: v }))
              }
            >
              <SelectTrigger
                id="initiative"
                className="w-full min-w-0 rounded-xl"
                size="default"
              >
                <SelectValue placeholder="Selecione o tipo de iniciativa" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)]"
              >
                {INITIATIVE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator className="bg-[#E5E7EB]" />

      <section className="space-y-4">
        <div>
          <h2 className="text-[#070F26] text-sm font-semibold tracking-wide uppercase">
            Contexto
          </h2>
          <p className="text-[#64748B] mt-1 text-[13px] leading-relaxed">
            O que o agente usará como base em todas as conversas.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="challenge_summary">Resumo do desafio</FieldLabel>
            <Textarea
              id="challenge_summary"
              name="challenge_summary"
              value={values.challenge_summary}
              onChange={(e) =>
                setValues((v) => ({ ...v, challenge_summary: e.target.value }))
              }
              placeholder="Em poucas frases, qual é o desafio?"
              rows={3}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="objective">Objetivo do projeto</FieldLabel>
            <Textarea
              id="objective"
              name="objective"
              value={values.objective}
              onChange={(e) =>
                setValues((v) => ({ ...v, objective: e.target.value }))
              }
              placeholder="O que precisa ser alcançado?"
              rows={3}
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-lg bg-primary px-5 text-primary-foreground hover:bg-primary-dark"
        >
          {isSubmitting ? 'Salvando…' : submitLabel}
        </Button>
        {isSubmitting ? (
          <Button type="button" variant="outline" disabled className="h-10 rounded-lg">
            Cancelar
          </Button>
        ) : (
          <Button type="button" variant="outline" className="h-10 rounded-lg" asChild>
            <Link to={cancelHref}>Cancelar</Link>
          </Button>
        )}
      </div>
    </form>
  )
}
