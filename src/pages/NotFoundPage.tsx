import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground text-sm">
        O endereço pode estar incorreto ou a página foi removida.
      </p>
      <Button asChild>
        <Link to="/">Ir ao painel</Link>
      </Button>
    </div>
  )
}
