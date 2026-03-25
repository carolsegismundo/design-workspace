/** Referência visual alinhada à marca NTT DATA Brasil (br.nttdata.com). */
export const NTT_BR = {
  name: 'NTT DATA Brasil',
  siteUrl: 'https://br.nttdata.com/',
  /** Azul institucional digital */
  blue: '#0066CC',
  blueHover: '#0052A3',
  blueMuted: '#E6F2FC',
} as const

/**
 * Painel escuro só no login (hero). O app autenticado usa superfície clara + acento
 * primário — mesma base tipográfica/cromática, composição diferente.
 */
export const shellDarkPanel = {
  gradient:
    'linear-gradient(145deg, #0a1628 0%, #0f172a 42%, #0c4a6e 100%)',
  dotOverlay: {
    backgroundImage:
      'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
    backgroundSize: '28px 28px',
  },
} as const
