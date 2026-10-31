// Local Postgres for development, powered by `embedded-postgres` (real Postgres
// binaries from npm — nothing to install). Data lives in ./.pgdata and survives restarts.
//
//   node scripts/local-db.js   -> start it and keep it running (used by `npm run dev`)
//   import { startLocalDb }     -> start it for a script, reusing one that's already up
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, '.pgdata')

export const LOCAL_DB = { port: 5433, user: 'pulsefit', password: 'pulsefit', database: 'pulsefit' }
export const LOCAL_DB_URL = `postgresql://${LOCAL_DB.user}:${LOCAL_DB.password}@localhost:${LOCAL_DB.port}/${LOCAL_DB.database}`

export function isLocalUrl(url) {
  try {
    return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(new URL(url).hostname)
  } catch {
    return false
  }
}

function portOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

export async function waitForLocalDb(timeoutMs = 60_000) {
  const end = Date.now() + timeoutMs
  while (Date.now() < end) {
    if (await portOpen(LOCAL_DB.port)) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

/** Starts the local database (or reuses a running one). Returns { stop, reused }. */
export async function startLocalDb() {
  if (await portOpen(LOCAL_DB.port)) return { reused: true, stop: async () => {} }

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    port: LOCAL_DB.port,
    user: LOCAL_DB.user,
    password: LOCAL_DB.password,
    persistent: true,
    onLog: () => {},
    onError: (e) => {
      const msg = String(e?.message ?? e)
      if (/error|fatal|panic/i.test(msg)) console.error('[db]', msg.trim())
    },
  })

  if (!existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    console.log('🗄️  First run: creating local Postgres data folder (.pgdata)…')
    await pg.initialise()
  }
  await pg.start()
  try {
    await pg.createDatabase(LOCAL_DB.database)
  } catch (err) {
    if (err?.code !== '42P04') throw err // 42P04 = database already exists
  }
  return { reused: false, stop: () => pg.stop() }
}

// CLI: keep the database running until the process is stopped.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.DATABASE_URL && !isLocalUrl(process.env.DATABASE_URL)) {
    console.log('☁️  DATABASE_URL points to a remote database — local Postgres not needed.')
    setInterval(() => {}, 1 << 30)
  } else {
    try {
      const db = await startLocalDb()
      console.log(
        db.reused
          ? `🗄️  Local Postgres already running on port ${LOCAL_DB.port}`
          : `🗄️  Local Postgres ready on port ${LOCAL_DB.port} (data in .pgdata)`,
      )
      let stopping = false
      const shutdown = async () => {
        if (stopping) return
        stopping = true
        await db.stop().catch(() => {})
        process.exit(0)
      }
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
      setInterval(() => {}, 1 << 30)
    } catch (err) {
      console.error('❌ Couldn’t start the local Postgres database:', err?.message ?? err)
      console.error(`   If port ${LOCAL_DB.port} is used by something else, close it and run "npm run dev" again.`)
      process.exit(1)
    }
  }
}
