import { isDemoMode } from '@/lib/demoMode'

export function DemoModeBanner() {
  if (!isDemoMode()) return null

  return (
    <div className="border-b border-[#FFC400]/40 bg-[#FFFBEB] px-4 py-2 text-center text-xs text-[#2E404D]">
      <strong className="text-[#070F26]">Modo demo</strong>
      <span className="text-[#5a6a75]">
        {' '}
        — dados só neste navegador. Configure{' '}
        <code className="rounded bg-white px-1 py-0.5 text-[11px] text-primary-dark border border-[#E5E7EB]">
          VITE_SUPABASE_*
        </code>{' '}
        e{' '}
        <code className="rounded bg-white px-1 py-0.5 text-[11px] text-primary-dark border border-[#E5E7EB]">
          GEMINI_API_KEY
        </code>{' '}
        (grátis no Google AI Studio, no .env) para nuvem e IA real.
      </span>
    </div>
  )
}
