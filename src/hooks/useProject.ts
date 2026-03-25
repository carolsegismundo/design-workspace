import { useEffect, useState } from 'react'

import { fetchProjectById } from '@/lib/projects'
import type { Project } from '@/types'

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => {
        setProject(null)
        setLoading(false)
        setError(null)
      })
      return
    }

    let cancelled = false
    /* eslint-disable react-hooks/set-state-in-effect -- loading antes do fetch */
    setLoading(true)
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */

    fetchProjectById(id)
      .then((data) => {
        if (!cancelled) setProject(data)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : 'Erro ao carregar o projeto'
          )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { project, loading, error }
}
