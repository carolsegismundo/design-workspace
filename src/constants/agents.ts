import type { AgentConfig } from '@/types'

/** Agentes e hubs alinhados ao layout de referência (PT-BR). */
export const AGENTS: AgentConfig[] = [
  {
    type: 'discovery',
    name: 'Agente de Descoberta',
    hub: 'Descoberta',
    hubSectionTitle: 'Hub de Descoberta',
    description:
      'Estrutura hipóteses, oportunidades e perguntas de descoberta',
  },
  {
    type: 'ux_writing',
    name: 'Agente de UX Writing',
    hub: 'Conteúdo',
    hubSectionTitle: 'Hub de Conteúdo',
    description:
      'Cria microcopy contextualizado em tom, público e objetivo',
  },
  {
    type: 'metrics',
    name: 'Agente de Métricas',
    hub: 'Métricas',
    hubSectionTitle: 'Hub de Métricas',
    description: 'Define e interpreta métricas de sucesso para o projeto',
  },
]

export function getAgentByType(type: string) {
  return AGENTS.find((a) => a.type === type)
}
