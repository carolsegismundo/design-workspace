export type ProjectPhase =
  | 'discovery'
  | 'ideation'
  | 'structuring'
  | 'refinement'
  | 'delivery'

export type AgentType = 'discovery' | 'ux_writing' | 'metrics'

export type InitiativeType =
  | 'new_product'
  | 'redesign'
  | 'discovery'
  | 'improvement'

export type { Database, Project } from './database'

export interface AgentConfig {
  type: AgentType
  /** Nome exibido (ex.: Agente de Descoberta) */
  name: string
  /** Nome curto do hub (tag) */
  hub: string
  /** Título da seção no hub do projeto */
  hubSectionTitle: string
  description: string
}
