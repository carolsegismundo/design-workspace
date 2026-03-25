import { LayoutDashboard, LogOut, Plus, Settings } from 'lucide-react'
import { NavLink, Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WORKSPACE } from '@/constants/workspaceVisual'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/demoMode'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useProjectsList } from '@/hooks/useProjectsList'

/** Navegação lateral; no mobile fica em drawer (controlado por `mobileOpen`). */
export type AppSidebarProps = {
  mobileOpen: boolean
}

const labelUpper =
  'text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500'

/**
 * Estilo SaaS tipo Tractian: lista compacta, item ativo em faixa azul-clara,
 * ícones discretos, bordas leves (sem “voltar” ao tema escuro do login).
 */
const navLinkClass = ({
  isActive,
  isPending,
}: {
  isActive: boolean
  isPending: boolean
}) =>
  cn(
    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium leading-snug transition-colors',
    isPending && 'opacity-70',
    isActive
      ? 'bg-[#e8f1fe] font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(0,102,204,0.12)]'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
  )

export function AppSidebar({ mobileOpen }: AppSidebarProps) {
  const { user, signOut } = useAuth()
  const { projects, loading } = useProjectsList()
  const location = useLocation()
  const showAccount = !isDemoMode() && isSupabaseConfigured() && user
  const mdUp = useMediaQuery('(min-width: 768px)')
  const drawerClosedMobile = !mdUp && !mobileOpen

  return (
    <aside
      id="app-sidebar-nav"
      className={cn(
        'relative flex shrink-0 flex-col overflow-hidden border-r bg-white',
        'shadow-[2px_0_24px_rgba(15,23,42,0.04)]',
        'fixed inset-y-0 left-0 z-50 h-auto min-h-0 w-[min(280px,calc(100vw-2.5rem))] max-w-[240px]',
        'transition-transform duration-200 ease-out will-change-transform',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        drawerClosedMobile && 'pointer-events-none md:pointer-events-auto',
        'md:static md:z-auto md:h-full md:self-stretch md:w-[232px] md:max-w-none'
      )}
      style={{ borderColor: WORKSPACE.navBorder }}
      aria-label="Navegação principal"
      inert={drawerClosedMobile ? true : undefined}
    >
      <div className="relative z-10 border-b border-slate-200/80 px-3 py-3.5">
        <img
          src="/ntt-data-logo.png"
          alt="NTT DATA"
          className="h-8 w-auto max-w-[132px] shrink-0 object-contain object-left"
          draggable={false}
        />
        <p className={cn(labelUpper, 'mt-2.5')}>Design Workspace</p>
      </div>

      <ScrollArea className="relative z-10 min-h-0 flex-1 px-2.5 py-3 [&_[data-slot=scroll-area-thumb]]:bg-slate-300/80 [&_[data-slot=scroll-area-scrollbar]]:border-transparent">
        <nav className="flex flex-col gap-0.5" aria-label="Principal">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard
              className="size-[17px] shrink-0 opacity-80"
              strokeWidth={1.75}
              aria-hidden
            />
            Painel
          </NavLink>
        </nav>

        <div className="mt-6">
          <div
            className={cn(
              labelUpper,
              'mb-1.5 flex items-center justify-between px-1'
            )}
          >
            <span>Projetos</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-md text-slate-500 hover:bg-[#e8f1fe] hover:text-primary"
              asChild
            >
              <Link to="/projects/new" title="Novo projeto">
                <Plus className="size-4" strokeWidth={2} />
                <span className="sr-only">Novo projeto</span>
              </Link>
            </Button>
          </div>

          <ul className="flex flex-col gap-px">
            {loading && (
              <li className="px-2 py-2 text-xs text-slate-500">
                Carregando…
              </li>
            )}
            {!loading &&
              projects.map((p) => {
                const active = location.pathname.startsWith(`/projects/${p.id}`)
                return (
                  <li key={p.id}>
                    <Link
                      to={`/projects/${p.id}`}
                      className={cn(
                        'block truncate rounded-md px-2.5 py-2 text-[13px] leading-snug transition-colors',
                        active
                          ? 'bg-[#e8f1fe] font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(0,102,204,0.12)]'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      )}
                      title={p.name}
                    >
                      {p.name}
                    </Link>
                  </li>
                )
              })}
            {!loading && projects.length === 0 && (
              <li className="px-2 py-2 text-xs leading-relaxed text-slate-500">
                Nenhum projeto. Use o + acima.
              </li>
            )}
          </ul>
        </div>
      </ScrollArea>

      <div className="relative z-10 mt-auto space-y-px border-t border-slate-200/80 p-2.5">
        {showAccount && (
          <p
            className="truncate px-2 py-1 text-[11px] leading-snug text-slate-500"
            title={user.email ?? undefined}
          >
            {user.email}
          </p>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
              isActive
                ? 'bg-[#e8f1fe] font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(0,102,204,0.12)]'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            )
          }
        >
          <Settings
            className="size-[17px] shrink-0 opacity-80"
            strokeWidth={1.75}
            aria-hidden
          />
          Configurações
        </NavLink>
        {showAccount && (
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => void signOut()}
          >
            <LogOut
              className="size-[17px] shrink-0 opacity-80"
              strokeWidth={1.75}
              aria-hidden
            />
            Sair
          </Button>
        )}
        <p className="px-2 pt-2 text-[10px] leading-tight text-slate-400">
          © {new Date().getFullYear()} · Uso interno NTT DATA
        </p>
      </div>
    </aside>
  )
}
