import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Tudo inline: a Vercel emite .js mas mantém imports `.ts` nos paths; Node não resolve .ts em runtime. */
const CHAT_API_ID = 'design-agent-board-gemini'
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

export default function handler(
  _req: VercelRequest,
  res: VercelResponse
): void {
  const gemini = Boolean(
    process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  )
  res.setHeader('X-Chat-API', CHAT_API_ID)
  res.status(200).json({
    ok: true,
    chatApi: CHAT_API_ID,
    provider: 'google-generative-ai',
    defaultModel: DEFAULT_GEMINI_MODEL,
    geminiKeyLoaded: gemini,
    hint: gemini
      ? 'Chave Gemini carregada.'
      : 'Defina GEMINI_API_KEY no .env na raiz do repositório e reinicie o servidor (npm run dev).',
  })
}
