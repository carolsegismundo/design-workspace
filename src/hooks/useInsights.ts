import { useCallback, useEffect, useState } from 'react'

import { listInsights } from '@/lib/insights'
import type { InsightRow } from '@/types/database'

export function useInsights(projectId: string | undefined) {
  const [insights, setInsights] = useState<InsightRow[]>([])
  const [loading, setLoading] = useState(Boolean(projectId))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) {
      setInsights([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await listInsights(projectId)
      setInsights(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar insights')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { insights, loading, error, refresh }
}
