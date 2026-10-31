// Local stand-in for Vercel's /api functions. It mounts every file in /api using
// Vercel's file-based routing rules, so the same handlers run unchanged on deploy:
//   api/stats.js            -> /api/stats
//   api/workouts/[id].js    -> /api/workouts/:id   (params merged into req.query)
//   api/_lib/*              -> ignored (underscore = not a route, same as Vercel)
import express from 'express'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ensureEnv } from '../scripts/ensure-env.js'
import { isLocalUrl, waitForLocalDb } from '../scripts/local-db.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API_DIR = path.join(ROOT, 'api')
const PORT = Number(process.env.API_PORT) || 3001

ensureEnv({ quiet: true })

if (isLocalUrl(process.env.DATABASE_URL)) {
  console.log('⏳ Waiting for local Postgres…')
  if (!(await waitForLocalDb())) console.error('⚠️  Local Postgres didn’t come up; API calls will report the database as unreachable.')
}

function findRoutes(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...findRoutes(full))
    else if (name.endsWith('.js')) out.push(full)
  }
  return out
}

function toRoutePath(file) {
  const rel = path.relative(API_DIR, file).replace(/\\/g, '/').replace(/\.js$/, '').replace(/(^|\/)index$/, '')
  return `/api/${rel}`.replace(/\[([^\]]+)\]/g, ':$1').replace(/\/$/, '')
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

// Static segments before dynamic ones, like Vercel.
const routes = findRoutes(API_DIR)
  .map((file) => ({ file, routePath: toRoutePath(file) }))
  .sort((a, b) => a.routePath.includes(':') - b.routePath.includes(':'))

for (const { file, routePath } of routes) {
  const mod = await import(pathToFileURL(file).href)
  app.all(routePath, (req, res) => {
    Object.assign(req.query, req.params)
    return mod.default(req, res)
  })
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'No such API route.' }))

app.listen(PORT, () => {
  console.log(`⚡ PulseFit API ready on http://localhost:${PORT} (${routes.length} routes)`)
  for (const r of routes) console.log(`   ${r.routePath}`)
})
