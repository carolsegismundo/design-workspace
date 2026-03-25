import { Brain, ExternalLink, Globe, Info, KeyRound } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NTT_BR } from '@/constants/nttBrand'

export function SettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-[#111827] text-2xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Informações sobre o sistema e os agentes disponíveis.
        </p>
      </div>

      <Card className="border-[#E5E7EB] rounded-2xl border border-primary/15 bg-ntt-muted/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="text-primary size-5" aria-hidden />
            {NTT_BR.name}
          </CardTitle>
          <CardDescription className="text-[#475569] leading-relaxed">
            O Design Workspace segue a identidade visual da NTT DATA. Conheça serviços,
            indústrias e insights no site corporativo.
          </CardDescription>
          <a
            href={NTT_BR.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-2 inline-flex w-fit items-center gap-1 text-sm font-medium hover:text-primary-dark hover:underline"
          >
            br.nttdata.com
            <ExternalLink className="size-3.5 opacity-70" aria-hidden />
          </a>
        </CardHeader>
      </Card>

      <Card className="border-[#E8E8E8] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="text-primary size-5" aria-hidden />
            Sobre o Design Workspace
          </CardTitle>
          <CardDescription className="text-[#2E404D] leading-relaxed">
            Espaço para alinhar designers e agentes de IA com contexto de projeto
            persistente — hipóteses, microcopy, métricas e insights no mesmo fluxo.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-[#E8E8E8] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="text-primary size-5" aria-hidden />
            Conta e acesso
          </CardTitle>
          <CardDescription className="text-[#2E404D] leading-relaxed">
            Na tela de login, qualquer pessoa pode criar conta com e-mail e senha (Supabase Auth).
            Cada usuário vê só os próprios projetos. Opcionalmente, o administrador também pode criar usuários em Authentication no painel.
            Aplique a migração{' '}
            <code className="bg-[#F4F6F8] rounded px-1 py-0.5 text-xs">
              supabase/migrations/20250326120000_auth_rls.sql
            </code>{' '}
            no SQL Editor para ativar <code className="bg-[#F4F6F8] rounded px-1 py-0.5 text-xs">user_id</code> e RLS.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-[#E8E8E8] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="text-primary size-5" aria-hidden />
            Modelo de IA (quando configurado)
          </CardTitle>
          <CardDescription>
            Com <code className="bg-[#F4F6F8] rounded px-1.5 py-0.5 text-xs">GEMINI_API_KEY</code> no servidor, o chat usa Google Gemini (modelo configurável via{' '}
            <code className="bg-[#F4F6F8] rounded px-1.5 py-0.5 text-xs">GEMINI_MODEL</code>
            ).
          </CardDescription>
        </CardHeader>
        <div className="text-[#2E404D] grid gap-3 px-6 pb-6 sm:grid-cols-2">
          <div className="bg-[#F4F6F8] rounded-lg border border-[#E8E8E8] p-3 text-xs">
            <p className="text-[#5a6a75] font-medium uppercase">Modo demo</p>
            <p className="mt-1 font-medium">Sem chave → resposta simulada</p>
          </div>
          <div className="bg-[#F4F6F8] rounded-lg border border-[#E8E8E8] p-3 text-xs">
            <p className="text-[#5a6a75] font-medium uppercase">Contexto</p>
            <p className="mt-1 font-medium">Injetado do cartão do projeto</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
