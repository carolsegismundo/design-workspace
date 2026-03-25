/**
 * Entry só para esbuild — não fica em api/*.ts para a Vercel não expor rota extra.
 * O build gera api/chat.js (um único bundle; sem imports .ts em runtime).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { handleChatPost } from '../server/chatApi.ts'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
}

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

  if (method !== 'POST') {
    for (const [k, v] of Object.entries(corsHeaders(req))) {
      res.setHeader(k, v)
    }
    res.setHeader('Allow', 'POST, OPTIONS')
    res.status(405).json({ message: 'Method not allowed' })
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
