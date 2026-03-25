import {
  BASE_SYSTEM_PROMPT,
  getAgentRuntimeConfig,
} from './agentRegistry.ts'
import { buildProjectContext } from './buildContext.ts'
import type { Project } from '../../types/index.ts'

/** System prompt completo: base + agente + fase + contexto do projeto. */
export function buildChatSystemPrompt(project: Project, agentType: string): string {
  const agentConfig = getAgentRuntimeConfig(agentType)
  const projectContext = buildProjectContext(project)
  const phaseInstruction =
    agentConfig.phasePrompts[project.project_phase] ?? ''

  return `${BASE_SYSTEM_PROMPT}

${agentConfig.systemPrompt}

${phaseInstruction}

---

${projectContext}`.trim()
}
