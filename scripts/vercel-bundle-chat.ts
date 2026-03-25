/**
 * Entry só para esbuild — gera api/chat.js (bundle único).
 * Não usar export const config (api.bodyParser) aqui: isso é do Next.js e no
 * runtime standalone da Vercel pode corromper o registo da função (ex.: 405).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { handleChatPost } from '../server/chatApi.ts'

function corsHeaders(req: VercelRequest): Record<string, string> {
  const origin = req.headers.origin
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  }
}

function getAuth(req: VercelRequest): string | undefined {
  const h = req.headers.authorization
  return typeof h === 'string' ? h : undefined
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const method = String(req.method ?? '').toUpperCase()

  if (method === 'OPTIONS') {
    for (const [k, v] of Object.entries(corsHeaders(req))) {
      res.setHeader(k, v)
    }
    res.status(204).end()
    return
  }

  for (const [k, v] of Object.entries(corsHeaders(req))) {
    res.setHeader(k, v)
  }

  const result = await handleChatPost({
    body: req.body,
    authorizationHeader: getAuth(req),
  })
  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v)
  }
  res.status(result.status).json(result.json)
}
