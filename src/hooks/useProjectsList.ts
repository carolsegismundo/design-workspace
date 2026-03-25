import { useEffect, useState } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { fetchProjectsList } from '@/lib/projects'
import type { Project } from '@/types'

type Row = Pick<
  Project,
  'id' | 'name' | 'client_name' | 'project_phase' | 'updated_at'
>

export function useProjectsList() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchProjectsList()
        if (!cancelled) setProjects(data)
      } catch (e: unknown) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : 'Erro ao carregar projetos'
          )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { projects, loading, error }
}
