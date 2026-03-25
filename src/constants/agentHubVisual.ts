import { BarChart3, Compass, PenLine, type LucideIcon } from 'lucide-react'

import type { AgentType } from '@/types'

/** Ícones dos agentes — cartões do hub usam fundo cinza neutro (estilo referência). */
export const AGENT_HUB_ICONS: Record<AgentType, LucideIcon> = {
  discovery: Compass,
  ux_writing: PenLine,
  metrics: BarChart3,
}

export const AGENT_HUB_ICON_SURFACE =
  'bg-[#F4F6F8] text-[#64748B]'

export const AGENT_CHAT_EMPTY_SURFACE = 'bg-[#F4F6F8]'
export const AGENT_CHAT_EMPTY_ICON = 'text-[#64748B]'
