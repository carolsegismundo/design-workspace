/** Sem Supabase no .env → dados ficam só no navegador (modo demo). */
export function isDemoMode(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return !url || !key
}
