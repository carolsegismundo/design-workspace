import type { Project } from '../../types/index.ts'

/** Monta o bloco de contexto do projeto para injeção no system prompt (PRD). */
export function buildProjectContext(project: Project): string {
  const sections: string[] = []

  sections.push(`=== CONTEXTO DO PROJETO ===`)
  sections.push(`Nome: ${project.name}`)

  if (project.client_name)
    sections.push(`Cliente/Área: ${project.client_name}`)

  if (project.initiative_type)
    sections.push(`Tipo de iniciativa: ${project.initiative_type}`)

  sections.push(`Fase atual: ${project.project_phase.toUpperCase()}`)

  if (project.challenge_summary)
    sections.push(`\nResumo do desafio:\n${project.challenge_summary}`)

  if (project.objective)
    sections.push(`\nObjetivo do projeto:\n${project.objective}`)

  if (project.problem)
    sections.push(`\nProblema a resolver:\n${project.problem}`)

  if (project.audience)
    sections.push(`\nPúblico-alvo:\n${project.audience}`)

  if (project.journey_flow)
    sections.push(`\nJornada/Fluxo envolvido:\n${project.journey_flow}`)

  const constraints = [
    project.technical_constraints &&
      `Técnicas: ${project.technical_constraints}`,
    project.business_constraints && `Negócio: ${project.business_constraints}`,
    project.deadline && `Prazo: ${project.deadline}`,
    project.dependencies && `Dependências: ${project.dependencies}`,
  ].filter(Boolean)

  if (constraints.length > 0)
    sections.push(`\nRestrições:\n${constraints.join('\n')}`)

  const success = [
    project.expected_metrics &&
      `Métricas esperadas: ${project.expected_metrics}`,
    project.desired_outcome && `Resultado desejado: ${project.desired_outcome}`,
    project.acceptance_criteria &&
      `Critérios de aceitação: ${project.acceptance_criteria}`,
  ].filter(Boolean)

  if (success.length > 0)
    sections.push(`\nDefinição de sucesso:\n${success.join('\n')}`)

  if (project.additional_notes)
    sections.push(`\nNotas adicionais:\n${project.additional_notes}`)

  sections.push(`\n=== FIM DO CONTEXTO ===`)

  return sections.join('\n')
}
