export function SupabaseMissing() {
  return (
    <div className="border-amber-500/40 bg-amber-500/10 rounded-lg border p-4 text-sm">
      <p className="font-medium text-amber-950 dark:text-amber-100">
        Supabase não configurado
      </p>
      <p className="text-muted-foreground mt-2 leading-relaxed">
        Crie um arquivo{' '}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">.env</code> na
        raiz do projeto com{' '}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">
          VITE_SUPABASE_URL
        </code>{' '}
        e{' '}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">
          VITE_SUPABASE_ANON_KEY
        </code>{' '}
        (no painel do Supabase: Configurações do projeto → API). Em seguida execute o
        SQL em{' '}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">
          supabase/migrations/
        </code>{' '}
        no SQL Editor e reinicie o{' '}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">npm run dev</code>
        .
      </p>
    </div>
  )
}
