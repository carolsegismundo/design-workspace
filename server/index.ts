import './loadEnv.ts'

import cors from 'cors'
import express from 'express'

import { handleChatPost } from './chatApi.ts'
import {
  DEFAULT_GEMINI_MODEL,
  getGeminiApiKey,
  getHealthJson,
} from './healthJson.ts'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  const { headers, json } = getHealthJson()
  for (const [k, v] of Object.entries(headers)) {
    res.setHeader(k, v)
  }
  res.json(json)
})

app.post('/api/chat', async (req, res) => {
  const auth =
    typeof req.headers.authorization === 'string'
      ? req.headers.authorization
      : undefined
  const result = await handleChatPost({
    body: req.body,
    authorizationHeader: auth,
  })
  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v)
  }
  res.status(result.status).json(result.json)
})

/** Padrão 3002 para evitar conflito com outro serviço antigo em 3001. */
const port = Number(process.env.CHAT_API_PORT ?? 3002)
app.listen(port, () => {
  const gemini = Boolean(getGeminiApiKey())
  console.log(`[chat-api] http://localhost:${port}  (design-agent-board-gemini)`)
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
  console.log(
    `[chat-api] GEMINI_API_KEY: ${gemini ? 'carregada' : 'ausente — defina no .env na raiz e reinicie'}`
  )
  console.log(`[chat-api] GEMINI_MODEL: ${model}`)
  console.log(`[chat-api] Diagnóstico: GET http://localhost:${port}/api/health`)
})
