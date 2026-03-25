/**
 * Empacota POST /api/chat num único api/chat.js (Node ESM).
 * Evita ERR_MODULE_NOT_FOUND por imports com sufixo .ts na Vercel.
 */
import * as esbuild from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

await esbuild.build({
  entryPoints: [path.join(root, 'scripts/vercel-bundle-chat.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: path.join(root, 'api/chat.js'),
  external: ['@vercel/node'],
  logLevel: 'info',
})
