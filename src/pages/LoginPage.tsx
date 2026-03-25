import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { shellDarkPanel } from '@/constants/nttBrand'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/demoMode'

/** Padrão visual inspirado em login enterprise (ex.: Tractian) — painel escuro + formulário claro. */
export function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from?.toString() ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) {
      navigate(from === '/login' ? '/' : from, { replace: true })
    }
  }, [session, loading, navigate, from])

  if (isDemoMode()) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfoMessage(null)
    setSubmitting(true)
    try {
      const fn = mode === 'signin' ? signIn : signUp
      const { error: err } = await fn(email.trim(), password)
      if (err) {
        setError(err.message)
        return
      }
      if (mode === 'signup') {
        setInfoMessage(
          'Conta criada. Se o Supabase exigir confirmação de e-mail, abra o link enviado à sua caixa de entrada antes de entrar.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <Loader2
          className="text-primary size-10 animate-spin"
          aria-hidden
        />
      </div>
    )
  }

  if (session) {
    return null
  }

  const inputClass =
    'h-11 rounded-lg border-slate-200 bg-white text-[15px] shadow-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/20'

  return (
    <div className="flex min-h-svh flex-col bg-white pb-[env(safe-area-inset-bottom)] md:flex-row">
      {/* Painel esquerdo — marca / narrativa (estilo industrial B2B) */}
      <div
        className="relative flex min-h-[min(240px,38vh)] flex-col justify-between overflow-hidden px-5 py-8 pt-[max(1.5rem,env(safe-area-inset-top))] sm:min-h-[260px] sm:px-8 md:min-h-svh md:w-[44%] md:max-w-xl md:px-10 md:py-12 lg:px-14 lg:py-14"
        style={{ background: shellDarkPanel.gradient }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={shellDarkPanel.dotOverlay}
          aria-hidden
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/ntt-data-logo.png"
              alt="NTT DATA"
              className="h-10 w-auto max-w-[140px] object-contain object-left brightness-0 invert md:h-11"
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 md:mt-10">
            Design Workspace
          </p>
          <h1 className="mt-3 max-w-md text-2xl font-bold leading-tight tracking-tight text-white md:text-[1.75rem] lg:text-3xl">
            Contexto de projeto e agentes de IA no mesmo fluxo.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Alinhe design, microcopy e métricas com hipóteses e insights — um
            copiloto para o seu trabalho.
          </p>
        </div>
        <p className="relative z-10 text-[11px] text-slate-500">
          © {new Date().getFullYear()} · Uso interno NTT DATA
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-10 md:px-12 md:py-10 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-[#0f172a] text-2xl font-bold tracking-tight md:text-[1.65rem]">
              {mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </h2>
            <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
              {mode === 'signin'
                ? 'Use o e-mail e a senha da sua conta.'
                : 'Defina e-mail e senha para começar a usar o app.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-[13px] font-semibold text-slate-700"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="nome@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-[13px] font-semibold text-slate-700"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                className="text-destructive rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-relaxed"
                role="alert"
              >
                {error}
              </p>
            )}

            {infoMessage && (
              <p
                className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm leading-relaxed text-teal-900"
                role="status"
              >
                {infoMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-lg bg-primary text-[15px] font-semibold shadow-md shadow-primary/25 hover:bg-primary-dark"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Aguarde…
                </>
              ) : mode === 'signin' ? (
                'Continuar'
              ) : (
                'Criar conta'
              )}
            </Button>

            <button
              type="button"
              className="text-primary text-[15px] font-medium hover:underline"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
                setInfoMessage(null)
              }}
            >
              {mode === 'signin'
                ? 'Não tem conta? Cadastre-se'
                : 'Já tem conta? Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
