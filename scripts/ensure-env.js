// Makes sure .env has what the API needs before anything starts.
// - JWT_SECRET missing  -> generate a strong one and save it to .env
// - DATABASE_URL missing -> point it at the local Postgres database
import { randomBytes } from 'node:crypto'
import { LOCAL_DB_URL } from './local-db.js'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ENV_PATH = path.join(ROOT, '.env')

function parseEnv(text) {
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m) continue
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

function setVar(text, key, value) {
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm')
  const line = `${key}=${value}`
  if (re.test(text)) return text.replace(re, line)
  return `${text}${text && !text.endsWith('\n') ? '\n' : ''}${line}\n`
}

export function ensureEnv({ quiet = false } = {}) {
  let text = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : ''
  let env = parseEnv(text)

  if (!env.JWT_SECRET) {
    text = setVar(text, 'JWT_SECRET', randomBytes(48).toString('base64url'))
    if (!('DATABASE_URL' in env)) text = setVar(text, 'DATABASE_URL', '')
    writeFileSync(ENV_PATH, text)
    env = parseEnv(text)
    if (!quiet) console.log('🔐 Generated a strong JWT_SECRET and saved it to .env')
  }

  // No database configured -> use the local Postgres that `npm run dev` starts.
  // (Swap in a Neon connection string here any time to use the cloud database.)
  if (!env.DATABASE_URL) {
    text = setVar(text, 'DATABASE_URL', LOCAL_DB_URL)
    writeFileSync(ENV_PATH, text)
    env = parseEnv(text)
    if (!quiet) console.log('🗄️  DATABASE_URL was empty — set it to the local Postgres database in .env')
  }

  process.env.DATABASE_URL ||= env.DATABASE_URL
  process.env.JWT_SECRET ||= env.JWT_SECRET
  return env
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ensureEnv()
}
