import type { VercelRequest, VercelResponse } from '@vercel/node'

import { getHealthJson } from '../server/healthJson.ts'

export default function handler(
  _req: VercelRequest,
  res: VercelResponse
): void {
  const { headers, json } = getHealthJson()
  for (const [k, v] of Object.entries(headers)) {
    res.setHeader(k, v)
  }
  res.status(200).json(json)
}
