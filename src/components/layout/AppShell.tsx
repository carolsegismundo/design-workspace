import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { DemoModeBanner } from '@/components/system/DemoModeBanner'
import { Button } from '@/components/ui/button'
import { NTT_BR } from '@/constants/nttBrand'
import { WORKSPACE } from '@/constants/workspaceVisual'
import { cn } from '@/lib/utils'

/**
 * Shell estilo dashboard B2B (referência Tractian): canvas cinza-claro,
 * coluna principal branca, scroll só no miolo.
 */
export function AppShell() {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMobileNavOpen(false))
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  useEffect(() => {
    if (mobileNavOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [mobileNavOpen])

  return (
    <div
      className="flex h-dvh min-h-0 w-full overflow-hidden overscroll-none"
      style={{ backgroundColor: WORKSPACE.canvas }}
    >
      <ScrollRestoration />
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200 supports-backdrop-filter:backdrop-blur-[2px] md:hidden',
          mobileNavOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileNavOpen(false)}
      />
      <AppSidebar mobileOpen={mobileNavOpen} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white shadow-[inset_1px_0_0_rgba(15,23,42,0.04)]">
        <header className="sticky top-0 z-30 flex h-[50px] shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/95 px-3 pt-[max(0.35rem,env(safe-area-inset-top))] pb-2 backdrop-blur-sm md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            aria-controls="app-sidebar-nav"
            aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileNavOpen ? (
              <X className="size-5" strokeWidth={2} />
            ) : (
              <Menu className="size-5" strokeWidth={2} />
            )}
          </Button>
          <span className="min-w-0 truncate text-[15px] font-semibold tracking-tight text-[#0f172a]">
            Design Workspace
          </span>
        </header>
        <DemoModeBanner />
        <div className="box-border flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] px-5 py-7 sm:px-9 sm:py-9 lg:px-11 lg:py-10">
            <div className="mx-auto w-full max-w-[1280px]">
              <Outlet />
            </div>
          </main>
          <footer className="shrink-0 border-t border-slate-200/70 bg-white px-4 py-3 sm:px-8">
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              <a
                href={NTT_BR.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary-dark hover:underline"
              >
                {NTT_BR.name}
              </a>
              <span className="mx-2 text-slate-300" aria-hidden>
                ·
              </span>
              <span className="hidden min-[380px]:inline">
                Consultoria e tecnologia para transformação digital
              </span>
              <span className="min-[380px]:hidden">Consultoria e tecnologia</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
