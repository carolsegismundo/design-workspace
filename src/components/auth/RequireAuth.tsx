import { Loader2 } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/demoMode'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/** Com Supabase configurado, exige sessão; modo demo (sem env) segue sem login. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (isDemoMode() || !isSupabaseConfigured()) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="bg-[#F4F6F8] flex min-h-svh items-center justify-center">
        <Loader2
          className="text-primary size-10 animate-spin"
          aria-hidden
        />
        <span className="sr-only">Carregando sessão…</span>
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }

  return <>{children}</>
}
