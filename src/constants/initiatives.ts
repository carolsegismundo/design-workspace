import type { InitiativeType } from '@/types'

export const INITIATIVE_OPTIONS: { value: InitiativeType; label: string }[] = [
  { value: 'new_product', label: 'Novo produto' },
  { value: 'redesign', label: 'Reformulação' },
  { value: 'discovery', label: 'Descoberta' },
  { value: 'improvement', label: 'Melhoria incremental' },
]
