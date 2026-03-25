export const CHAT_API_ID = 'design-agent-board-gemini'

/** Padrão: flash completo costuma ter mais capacidade que flash-lite em picos de procura. */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  )
}

export function baseChatHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { 'X-Chat-API': CHAT_API_ID }
  if (extra) {
    Object.assign(h, extra)
  }
  return h
}

export function getHealthJson(): {
  headers: Record<string, string>
  json: Record<string, unknown>
} {
  const gemini = Boolean(getGeminiApiKey())
  return {
    headers: baseChatHeaders(),
    json: {
      ok: true,
      chatApi: CHAT_API_ID,
      provider: 'google-generative-ai',
      defaultModel: DEFAULT_GEMINI_MODEL,
      geminiKeyLoaded: gemini,
      hint: gemini
        ? 'Chave Gemini carregada.'
        : 'Defina GEMINI_API_KEY no .env na raiz do repositório e reinicie o servidor (npm run dev).',
    },
  }
}
