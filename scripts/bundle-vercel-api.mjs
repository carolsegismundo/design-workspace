/**
 * Empacota POST /api/chat num único api/chat.js (Node ESM).
 * Evita ERR_MODULE_NOT_FOUND por imports com sufixo .ts na Vercel.
 * O ficheiro api/chat.js deve estar no Git: a Vercel pode não servir a função
 * se só existir após o build e estiver em .gitignore.
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
