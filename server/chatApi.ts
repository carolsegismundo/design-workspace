import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

import { buildChatSystemPrompt } from '../src/lib/ai/buildChatPrompt.ts'
import type { Project } from '../src/types/index.ts'

export const CHAT_API_ID = 'design-agent-board-gemini'

/** Modelo estável atual (Google AI); 1.5 foi removido da API v1beta — ver documentação. */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite'

const MAX_ATTACHMENTS = 4
const MAX_B64_PER_PART = 6 * 1024 * 1024

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  )
}

function requiresSupabaseAuthForChat(): boolean {
  return Boolean(
    process.env.VITE_SUPABASE_URL?.trim() &&
      process.env.VITE_SUPABASE_ANON_KEY?.trim()
  )
}

/** Com Supabase no .env, exige JWT válido e que o projeto exista para o usuário (RLS). */
export async function assertChatAuthorized(
  authorizationHeader: string | undefined,
  projectId: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!requiresSupabaseAuthForChat()) {
    return { ok: true }
  }

  const auth = authorizationHeader
  if (!auth?.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      message: 'Não autenticado. Faça login no app.',
    }
  }

  const token = auth.slice(7)
  const url = process.env.VITE_SUPABASE_URL!
  const key = process.env.VITE_SUPABASE_ANON_KEY!

  const supabaseAnon = createClient(url, key)
  const {
    data: { user },
    error: userErr,
  } = await supabaseAnon.auth.getUser(token)

  if (userErr || !user) {
    return {
      ok: false,
      status: 401,
      message: 'Sessão inválida ou expirada. Entre novamente.',
    }
  }

  const supabaseUser = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: row, error: rowErr } = await supabaseUser
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .maybeSingle()

  if (rowErr || !row) {
    return {
      ok: false,
      status: 403,
      message: 'Projeto não encontrado ou sem permissão.',
    }
  }

  return { ok: true }
}

function baseChatHeaders(extra?: Record<string, string>): Record<string, string> {
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

function allowedMime(m: string): boolean {
  const x = m.toLowerCase()
  if (x.startsWith('image/')) return true
  if (x === 'application/pdf' || x === 'text/plain') return true
  if (x.startsWith('audio/')) return true
  return false
}

type ChatAttachmentBody = { mimeType: string; data: string; filename?: string }

function mapGeminiFailure(e: unknown): { status: number; message: string } {
  const raw = e instanceof Error ? e.message : String(e)
  if (/404|not found|not supported for generateContent/i.test(raw)) {
    return {
      status: 502,
      message:
        'Modelo Gemini inválido ou descontinuado nesta API. No .env use por exemplo: GEMINI_MODEL=gemini-2.5-flash-lite ou GEMINI_MODEL=gemini-2.5-flash (lista: https://ai.google.dev/gemini-api/docs/models)',
    }
  }
  if (
    /429|Too Many Requests|quota|rate limit|exceeded your current quota/i.test(
      raw
    )
  ) {
    return {
      status: 429,
      message:
        'Limite do Gemini atingido (quota ou pedidos por minuto). Aguarde ~1 minuto ou experimente GEMINI_MODEL=gemini-2.5-flash ou gemini-2.5-pro. Detalhes: https://ai.google.dev/gemini-api/docs/rate-limits',
    }
  }
  const short =
    raw.length > 1200 ? `${raw.slice(0, 1200)}… (mensagem truncada)` : raw
  return { status: 500, message: short }
}

export async function handleChatPost(input: {
  body: unknown
  authorizationHeader: string | undefined
}): Promise<{
  status: number
  headers: Record<string, string>
  json: { message?: string }
}> {
  try {
    const body = input.body as {
      project?: Project
      agentType?: string
      userMessage?: string
      history?: { role: string; content: string }[]
      attachments?: ChatAttachmentBody[]
    }

    const { project, agentType, userMessage, history, attachments } = body

    if (!project || !agentType || typeof userMessage !== 'string') {
      return {
        status: 400,
        headers: baseChatHeaders(),
        json: {
          message: 'Campos obrigatórios: project, agentType, userMessage',
        },
      }
    }

    const trimmed = userMessage.trim()
    const rawAtt = Array.isArray(attachments) ? attachments : []
    if (rawAtt.length > MAX_ATTACHMENTS) {
      return {
        status: 400,
        headers: baseChatHeaders(),
        json: {
          message: `No máximo ${MAX_ATTACHMENTS} anexos por mensagem.`,
        },
      }
    }
    const cleaned: ChatAttachmentBody[] = []
    for (const a of rawAtt) {
      if (
        !a ||
        typeof a.mimeType !== 'string' ||
        typeof a.data !== 'string' ||
        !allowedMime(a.mimeType)
      ) {
        return {
          status: 400,
          headers: baseChatHeaders(),
          json: { message: 'Anexo inválido ou tipo não permitido.' },
        }
      }
      if (a.data.length > MAX_B64_PER_PART) {
        return {
          status: 400,
          headers: baseChatHeaders(),
          json: { message: 'Anexo demasiado grande.' },
        }
      }
      cleaned.push({
        mimeType: a.mimeType,
        data: a.data,
        filename: typeof a.filename === 'string' ? a.filename : undefined,
      })
    }

    if (!trimmed && cleaned.length === 0) {
      return {
        status: 400,
        headers: baseChatHeaders(),
        json: {
          message: 'Envie uma mensagem ou pelo menos um anexo.',
        },
      }
    }

    let systemPrompt: string
    try {
      systemPrompt = buildChatSystemPrompt(project, agentType)
    } catch (e) {
      return {
        status: 400,
        headers: baseChatHeaders(),
        json: {
          message: e instanceof Error ? e.message : 'Agente inválido',
        },
      }
    }

    const authResult = await assertChatAuthorized(
      input.authorizationHeader,
      project.id
    )
    if (!authResult.ok) {
      return {
        status: authResult.status,
        headers: baseChatHeaders(),
        json: { message: authResult.message },
      }
    }

    const geminiKey = getGeminiApiKey()
    if (!geminiKey) {
      const snippet = systemPrompt.slice(0, 900)
      const attNote =
        cleaned.length > 0
          ? `\n\n**Anexos recebidos:** ${cleaned.length} ficheiro(s) (${cleaned.map((c) => c.filename ?? c.mimeType).join(', ')}). Com a API ativa, o Gemini analisaria estes ficheiros.`
          : ''
      const demoReply = `**Resposta de demonstração** (sem \`GEMINI_API_KEY\` no servidor)

Sua mensagem: *${trimmed.slice(0, 280) || '(só anexos)'}${trimmed.length > 280 ? '…' : ''}*${attNote}

**Projeto:** ${project.name} · **Fase:** ${project.project_phase} · **Agente:** ${agentType}

Para respostas reais com **Gemini**, configure \`GEMINI_API_KEY\` no \`.env\` na raiz deste projeto (chave grátis em [Google AI Studio](https://aistudio.google.com/)) e reinicie \`npm run dev\`.

Com a chave configurada, o modelo usaria o contexto abaixo (trecho do system prompt):

\`\`\`text
${snippet}${systemPrompt.length > 900 ? '\n…' : ''}
\`\`\`
`
      return {
        status: 200,
        headers: baseChatHeaders({ 'X-Chat-Provider': 'demo' }),
        json: { message: demoReply },
      }
    }

    const modelName = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
    const genAI = new GoogleGenerativeAI(geminiKey)
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    })
    const geminiHistory = (history ?? []).map((m) => ({
      role:
        m.role === 'assistant'
          ? ('model' as const)
          : ('user' as const),
      parts: [{ text: m.content }],
    }))
    const chat = genModel.startChat({ history: geminiHistory })
    let text: string
    try {
      const parts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = []
      if (trimmed) {
        parts.push({ text: trimmed })
      } else {
        parts.push({
          text: 'O utilizador enviou ficheiros ou áudio sem texto. Analise o conteúdo e responda em português (pt-BR), de forma útil e objetiva.',
        })
      }
      for (const a of cleaned) {
        parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } })
      }
      const geminiResult = await chat.sendMessage(parts)
      text = geminiResult.response.text()
    } catch (geminiErr) {
      console.error(geminiErr)
      const mapped = mapGeminiFailure(geminiErr)
      return {
        status: mapped.status,
        headers: baseChatHeaders({ 'X-Gemini-Model': modelName }),
        json: { message: mapped.message },
      }
    }
    return {
      status: 200,
      headers: baseChatHeaders({
        'X-Chat-Provider': 'gemini',
        'X-Gemini-Model': modelName,
      }),
      json: { message: text },
    }
  } catch (e) {
    console.error(e)
    const mapped = mapGeminiFailure(e)
    return {
      status: mapped.status,
      headers: baseChatHeaders(),
      json: { message: mapped.message },
    }
  }
}
