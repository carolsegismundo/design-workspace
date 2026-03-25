import type { ProjectPhase } from '@/types'

/** Badges com paleta da marca + contraste acessível */
export const PROJECT_PHASES: {
  value: ProjectPhase
  label: string
  badgeClass: string
  description: string
}[] = [
  {
    value: 'discovery',
    label: 'Descoberta',
    badgeClass:
      'border border-primary/30 bg-ntt-muted text-primary-dark',
    description: 'Entender o problema e mapear oportunidades',
  },
  {
    value: 'ideation',
    label: 'Ideação',
    badgeClass:
      'border border-[#FFC400]/50 bg-[#FFFBEB] text-[#2E404D]',
    description: 'Explorar e divergir em possibilidades de solução',
  },
  {
    value: 'structuring',
    label: 'Estruturação',
    badgeClass:
      'border border-primary/25 bg-ntt-muted text-primary-dark',
    description: 'Definir fluxos, hierarquia e estrutura da solução',
  },
  {
    value: 'refinement',
    label: 'Refinamento',
    badgeClass:
      'border border-[#00CB5D]/40 bg-[#E6FAF0] text-[#2E404D]',
    description: 'Detalhar, consistir e polir a interface',
  },
  {
    value: 'delivery',
    label: 'Entrega',
    badgeClass:
      'border border-[#FF7A00]/40 bg-[#FFF4E8] text-[#2E404D]',
    description: 'Preparar argumentação e documentação para entrega',
  },
]

export function getPhaseLabel(phase: ProjectPhase): string {
  return PROJECT_PHASES.find((p) => p.value === phase)?.label ?? phase
}

export function getPhaseBadgeClass(phase: ProjectPhase): string {
  return (
    PROJECT_PHASES.find((p) => p.value === phase)?.badgeClass ??
    'border border-border bg-muted text-muted-foreground'
  )
}

/** Barra vertical nos cards (referência tipo Tractian — status à vista). */
export function getPhaseStripeClass(phase: ProjectPhase): string {
  const map: Record<ProjectPhase, string> = {
    discovery: 'bg-[#2563eb]',
    ideation: 'bg-[#ca8a04]',
    structuring: 'bg-[#0284c7]',
    refinement: 'bg-[#16a34a]',
    delivery: 'bg-[#ea580c]',
  }
  return map[phase] ?? 'bg-slate-400'
}
