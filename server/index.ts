import './loadEnv.ts'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import cors from 'cors'
import express from 'express'

import { buildChatSystemPrompt } from '../src/lib/ai/buildChatPrompt.ts'
import type { Project } from '../src/types/index.ts'

const CHAT_API_ID = 'design-agent-board-gemini'

function getGeminiApiKey(): string | undefined {
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
async function assertChatAuthorized(
  req: express.Request,
  projectId: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!requiresSupabaseAuthForChat()) {
    return { ok: true }
  }

  const auth = req.headers.authorization
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

function setChatHeaders(res: express.Response, extra?: Record<string, string>) {
  res.setHeader('X-Chat-API', CHAT_API_ID)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      res.setHeader(k, v)
    }
  }
}

/** Modelo estável atual (Google AI); 1.5 foi removido da API v1beta — ver documentação. */
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite'

const MAX_ATTACHMENTS = 4
const MAX_B64_PER_PART = 6 * 1024 * 1024

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
  if (/429|Too Many Requests|quota|rate limit|exceeded your current quota/i.test(raw)) {
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

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  const gemini = Boolean(getGeminiApiKey())
  setChatHeaders(res)
  res.json({
    ok: true,
    chatApi: CHAT_API_ID,
    provider: 'google-generative-ai',
    defaultModel: DEFAULT_GEMINI_MODEL,
    geminiKeyLoaded: gemini,
    hint: gemini
      ? 'Chave Gemini carregada.'
      : 'Defina GEMINI_API_KEY no .env na raiz do repositório e reinicie o servidor (npm run dev).',
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const body = req.body as {
      project?: Project
      agentType?: string
      userMessage?: string
      history?: { role: string; content: string }[]
      attachments?: ChatAttachmentBody[]
    }

    const { project, agentType, userMessage, history, attachments } = body

    if (!project || !agentType || typeof userMessage !== 'string') {
      setChatHeaders(res)
      res.status(400).json({
        message: 'Campos obrigatórios: project, agentType, userMessage',
      })
      return
    }

    const trimmed = userMessage.trim()
    const rawAtt = Array.isArray(attachments) ? attachments : []
    if (rawAtt.length > MAX_ATTACHMENTS) {
      setChatHeaders(res)
      res.status(400).json({
        message: `No máximo ${MAX_ATTACHMENTS} anexos por mensagem.`,
      })
      return
    }
    const cleaned: ChatAttachmentBody[] = []
    for (const a of rawAtt) {
      if (
        !a ||
        typeof a.mimeType !== 'string' ||
        typeof a.data !== 'string' ||
        !allowedMime(a.mimeType)
      ) {
        setChatHeaders(res)
        res.status(400).json({ message: 'Anexo inválido ou tipo não permitido.' })
        return
      }
      if (a.data.length > MAX_B64_PER_PART) {
        setChatHeaders(res)
        res.status(400).json({ message: 'Anexo demasiado grande.' })
        return
      }
      cleaned.push({
        mimeType: a.mimeType,
        data: a.data,
        filename: typeof a.filename === 'string' ? a.filename : undefined,
      })
    }

    if (!trimmed && cleaned.length === 0) {
      setChatHeaders(res)
      res.status(400).json({
        message: 'Envie uma mensagem ou pelo menos um anexo.',
      })
      return
    }

    let systemPrompt: string
    try {
      systemPrompt = buildChatSystemPrompt(project, agentType)
    } catch (e) {
      setChatHeaders(res)
      res.status(400).json({
        message: e instanceof Error ? e.message : 'Agente inválido',
      })
      return
    }

    const authResult = await assertChatAuthorized(req, project.id)
    if (!authResult.ok) {
      setChatHeaders(res)
      res.status(authResult.status).json({ message: authResult.message })
      return
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
      setChatHeaders(res, { 'X-Chat-Provider': 'demo' })
      res.json({ message: demoReply })
      return
    }

    const modelName =
      process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
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
      setChatHeaders(res, { 'X-Gemini-Model': modelName })
      res.status(mapped.status).json({ message: mapped.message })
      return
    }
    setChatHeaders(res, {
      'X-Chat-Provider': 'gemini',
      'X-Gemini-Model': modelName,
    })
    res.json({ message: text })
  } catch (e) {
    console.error(e)
    const mapped = mapGeminiFailure(e)
    setChatHeaders(res)
    res.status(mapped.status).json({ message: mapped.message })
  }
})

/** Padrão 3002 para evitar conflito com outro serviço antigo em 3001. */
const port = Number(process.env.CHAT_API_PORT ?? 3002)
app.listen(port, () => {
  const gemini = getGeminiApiKey()
  console.log(`[chat-api] http://localhost:${port}  (${CHAT_API_ID})`)
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
  console.log(
    `[chat-api] GEMINI_API_KEY: ${gemini ? 'carregada' : 'ausente — defina no .env na raiz e reinicie'}`
  )
  console.log(`[chat-api] GEMINI_MODEL: ${model}`)
  console.log(`[chat-api] Diagnóstico: GET http://localhost:${port}/api/health`)
})
