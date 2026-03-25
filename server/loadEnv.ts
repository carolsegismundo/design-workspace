import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

/** Na Vercel as variáveis vêm do painel; evita dotenv com paths quebrados no bundle. */
if (!process.env.VERCEL) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
}
