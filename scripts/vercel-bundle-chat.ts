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

function getAuth(req: VercelRequest): string | undefined {
  const h = req.headers.authorization
  return typeof h === 'string' ? h : undefined
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
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
