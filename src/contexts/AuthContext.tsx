import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { Session, User } from '@supabase/supabase-js'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(() => isSupabaseConfigured())

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return
    }

    const supabase = getSupabase()

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase não configurado') }
    }
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase não configurado') }
    }
    const supabase = getSupabase()
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const supabase = getSupabase()
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    (): AuthContextValue => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook consumido fora deste arquivo; Fast Refresh exige um componente por ficheiro. */
// eslint-disable-next-line react-refresh/only-export-components -- hook pareado com AuthProvider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
