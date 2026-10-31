// npm run db:setup — runs db/schema.sql then db/seed.sql against DATABASE_URL.
// Both files are idempotent, so this is safe to run as often as you like.
// Works with the local Postgres (started automatically if needed) or with Neon.
import { Pool as NeonPool } from '@neondatabase/serverless'
import pg from 'pg'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureEnv } from './ensure-env.js'
import { isLocalUrl, startLocalDb } from './local-db.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = ensureEnv()
const local = isLocalUrl(env.DATABASE_URL)

const localDb = local ? await startLocalDb() : null
const pool = local
  ? new pg.Pool({ connectionString: env.DATABASE_URL })
  : new NeonPool({ connectionString: env.DATABASE_URL })

console.log(`Database: ${local ? 'local Postgres (.pgdata)' : 'remote (Neon)'}`)

try {
  for (const file of ['schema.sql', 'seed.sql']) {
    process.stdout.write(`▶ Running db/${file} … `)
    await pool.query(readFileSync(path.join(ROOT, 'db', file), 'utf8'))
    console.log('done')
  }

  const { rows } = await pool.query(`
    SELECT 'exercises' AS "table", count(*)::int AS rows FROM exercises
    UNION ALL SELECT 'classes', count(*)::int FROM classes
    UNION ALL SELECT 'classes (this week)', count(*)::int FROM classes
      WHERE start_time >= date_trunc('week', now()) AND start_time < date_trunc('week', now()) + interval '7 days'
    UNION ALL SELECT 'users', count(*)::int FROM users
    UNION ALL SELECT 'workouts', count(*)::int FROM workouts`)
  console.log('\nRow counts:')
  console.table(rows)
  console.log('✅ Database ready.')
} catch (err) {
  console.error('\n❌ Database setup failed:', err.message || err.code)
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|password authentication|getaddrinfo/i.test(`${err.message} ${err.code}`)) {
    console.error('   Check that DATABASE_URL in .env is correct and the database is reachable.')
  }
  process.exitCode = 1
} finally {
  await pool.end()
  if (localDb && !localDb.reused) await localDb.stop()
}
